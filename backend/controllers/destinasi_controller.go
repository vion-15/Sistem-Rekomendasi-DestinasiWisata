package controllers

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"backend-wisata/config"
	"backend-wisata/models"
	"backend-wisata/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ============================
// HELPER: HIT API PYTHON UNTUK CLEAN TEXT
// ============================
type CleanRequest struct {
	Text string `json:"text"`
}

type CleanResponse struct {
	CleanedText string `json:"cleaned_text"`
}

type DestinasiAI struct {
	ID        uuid.UUID `json:"id"`
	Nama      string    `json:"nama"`
	Kategori  string    `json:"kategori"`
	Deskripsi string    `json:"deskripsi"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
}

func getCleanTextFromPython(text string) string {
	if text == "" {
		return ""
	}

	reqBody := CleanRequest{Text: text}
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		log.Printf("Error marshalling clean request: %v", err)
		return text // Jika gagal, kembalikan teks aslinya sebagai fallback
	}

	resp, err := http.Post("http://localhost:8000/clean-text", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Printf("Error calling python clean-text: %v", err)
		return text
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Python returned non-200 status: %d", resp.StatusCode)
		return text
	}

	var resBody CleanResponse
	if err := json.NewDecoder(resp.Body).Decode(&resBody); err != nil {
		log.Printf("Error decoding clean response: %v", err)
		return text
	}

	return resBody.CleanedText
}

// ============================
// CREATE DESTINASI
// ============================
func CreateDestinasi(c *gin.Context) {
	nama := strings.TrimSpace(c.PostForm("nama"))
	deskripsi := strings.TrimSpace(c.PostForm("deskripsi"))
	alamat := strings.TrimSpace(c.PostForm("alamat"))
	kota := strings.TrimSpace(c.PostForm("kota"))
	kategori := strings.TrimSpace(c.PostForm("kategori"))
	idPetugasStr := strings.TrimSpace(c.PostForm("id_petugas"))
	latStr := strings.TrimSpace(c.PostForm("latitude"))
	lonStr := strings.TrimSpace(c.PostForm("longitude"))

	// 1. Validasi input wajib
	if nama == "" || deskripsi == "" || alamat == "" || kota == "" || kategori == "" || latStr == "" || lonStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "semua field wajib diisi"})
		return
	}

	var existing models.Destinasi

	if err := config.DB.
		Where("LOWER(nama) = LOWER(?)", nama).
		First(&existing).Error; err == nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "destinasi sudah terdaftar",
		})
		return
	}

	var petugasID *uuid.UUID

	if idPetugasStr != "" {
		parsedID, err := uuid.Parse(idPetugasStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "id_pengelola tidak valid",
			})
			return
		}

		var petugas models.Petugas

		// Jika ID tersebut memang milik petugas,
		// simpan sebagai PetugasID.
		if err := config.DB.First(&petugas, "id = ?", parsedID).Error; err == nil {
			petugasID = &parsedID
		}

		// Jika tidak ditemukan,
		// berarti kemungkinan admin.
		// Biarkan PetugasID tetap nil.
	}

	// 4. Parse Latitude & Longitude (String ke Float64)
	lat, errLat := strconv.ParseFloat(latStr, 64)
	lon, errLon := strconv.ParseFloat(lonStr, 64)
	if errLat != nil || errLon != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format koordinat latitude atau longitude tidak valid"})
		return
	}

	if lat < -90 || lat > 90 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "latitude harus antara -90 sampai 90",
		})
		return
	}

	if lon < -180 || lon > 180 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "longitude harus antara -180 sampai 180",
		})
		return
	}

	// 5. Upload Gambar
	fileHeader, err := c.FormFile("gambar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "gambar destinasi wajib diunggah"})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membaca file gambar"})
		return
	}
	defer file.Close()

	gambarURL, err := utils.UploadImage(file, "wisata_destinasi")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "upload gambar gagal: " + err.Error()})
		return
	}

	// 🌟 PROSES CLEAN TEXT SEBELUM DISIMPAN 🌟
	deskripsiClean := getCleanTextFromPython(deskripsi)

	// 6. Simpan ke Database
	destinasi := models.Destinasi{
		Nama:           nama,
		Deskripsi:      deskripsi,
		DeskripsiClean: deskripsiClean, // 👈 Simpan hasil clean text
		Alamat:         alamat,
		Latitude:       lat,
		Longitude:      lon,
		Gambar:         gambarURL,
		Kota:           kota,
		Kategori:       kategori,
		PetugasID:      petugasID,
	}

	if err := config.DB.Create(&destinasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyimpan destinasi ke database"})
		return
	}

	go func() {
		_, err := http.Post(
			"http://localhost:8000/reload-destinations",
			"application/json",
			nil,
		)

		if err != nil {
			log.Println("reload cache gagal:", err)
		}
	}()

	// Load relasi petugas agar respon JSON memiliki struktur objek Petugas yang lengkap
	config.DB.Preload("Petugas").First(&destinasi, "id = ?", destinasi.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "destinasi berhasil ditambahkan",
		"data":    destinasi,
	})
}

// ============================
// GET ALL DESTINASI
// ============================
func GetDestinasi(c *gin.Context) {
	var destinasiList []models.Destinasi

	// Preload("Petugas") otomatis melakukan relasi join ke tabel petugas
	if err := config.DB.Preload("Petugas").Find(&destinasiList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil data destinasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": destinasiList,
	})
}

// ============================
// UPDATE DESTINASI
// ============================
func UpdateDestinasi(c *gin.Context) {
	id := c.Param("id")

	// Validasi UUID destinasi
	destinasiID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var destinasi models.Destinasi

	// Cek data destinasi
	if err := config.DB.First(&destinasi, "id = ?", destinasiID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "data destinasi tidak ditemukan",
		})
		return
	}

	// Ambil data form
	nama := strings.TrimSpace(c.PostForm("nama"))
	deskripsi := strings.TrimSpace(c.PostForm("deskripsi"))
	alamat := strings.TrimSpace(c.PostForm("alamat"))
	kota := strings.TrimSpace(c.PostForm("kota"))
	kategori := strings.TrimSpace(c.PostForm("kategori"))
	idPetugasStr := strings.TrimSpace(c.PostForm("id_petugas"))
	latStr := strings.TrimSpace(c.PostForm("latitude"))
	lonStr := strings.TrimSpace(c.PostForm("longitude"))

	// Menyimpan gambar lama jika ada upload gambar baru
	var oldGambar string

	// Update nama
	if nama != "" {

		// Cek duplicate nama destinasi selain dirinya sendiri
		var existing models.Destinasi

		if err := config.DB.
			Where("LOWER(nama) = LOWER(?) AND id <> ?", nama, destinasi.ID).
			First(&existing).Error; err == nil {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": "nama destinasi sudah digunakan",
			})
			return
		}

		destinasi.Nama = nama
	}

	// Update deskripsi & deskripsi clean
	if deskripsi != "" {
		destinasi.Deskripsi = deskripsi
		destinasi.DeskripsiClean = getCleanTextFromPython(deskripsi) // 👈 Update clean text
	}

	// Update alamat
	if alamat != "" {
		destinasi.Alamat = alamat
	}

	// Update kota
	if kota != "" {
		destinasi.Kota = kota
	}

	// Update kategori
	if kategori != "" {
		destinasi.Kategori = kategori
	}

	// Update petugas
	// Update petugas (jika ID tersebut memang milik petugas)
	if idPetugasStr != "" {
		parsedID, err := uuid.Parse(idPetugasStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "id_pengelola tidak valid",
			})
			return
		}

		var petugas models.Petugas

		// Jika ditemukan sebagai petugas, simpan ID petugas
		if err := config.DB.First(&petugas, "id = ?", parsedID).Error; err == nil {
			destinasi.PetugasID = &parsedID
		}

		// Jika tidak ditemukan, diasumsikan yang melakukan edit adalah admin.
		// Tidak mengubah PetugasID.
	}

	// Update latitude
	if latStr != "" {

		lat, err := strconv.ParseFloat(latStr, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "format latitude tidak valid",
			})
			return
		}

		if lat < -90 || lat > 90 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "latitude harus antara -90 sampai 90",
			})
			return
		}

		destinasi.Latitude = lat
	}

	// Update longitude
	if lonStr != "" {

		lon, err := strconv.ParseFloat(lonStr, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "format longitude tidak valid",
			})
			return
		}

		if lon < -180 || lon > 180 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "longitude harus antara -180 sampai 180",
			})
			return
		}

		destinasi.Longitude = lon
	}

	// Upload gambar baru jika ada
	fileHeader, err := c.FormFile("gambar")
	if err == nil {

		// Simpan gambar lama
		oldGambar = destinasi.Gambar

		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal membaca file gambar",
			})
			return
		}
		defer file.Close()

		gambarURL, err := utils.UploadImage(
			file,
			"wisata_destinasi",
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal upload gambar",
			})
			return
		}

		destinasi.Gambar = gambarURL
	}

	// Simpan perubahan
	if err := config.DB.Save(&destinasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengupdate data destinasi",
		})
		return
	}

	go func() {
		_, err := http.Post(
			"http://localhost:8000/reload-destinations",
			"application/json",
			nil,
		)

		if err != nil {
			log.Println("reload cache gagal:", err)
		}
	}()

	// Hapus gambar lama setelah database berhasil diupdate
	if oldGambar != "" {
		_ = utils.DeleteImageByURL(oldGambar)
	}

	// Load relasi petugas terbaru
	config.DB.Preload("Petugas").
		First(&destinasi, "id = ?", destinasi.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "data destinasi berhasil diupdate",
		"data":    destinasi,
	})
}

// ============================
// DELETE DESTINASI
// ============================
func DeleteDestinasi(c *gin.Context) {
	id := c.Param("id")

	// Validasi UUID
	destinasiID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var destinasi models.Destinasi

	// Cek data
	if err := config.DB.First(&destinasi, "id = ?", destinasiID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "data destinasi tidak ditemukan",
		})
		return
	}

	// Hapus gambar dari Cloudinary
	if destinasi.Gambar != "" {
		_ = utils.DeleteImageByURL(destinasi.Gambar)
	}

	// Soft delete
	if err := config.DB.Delete(&destinasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus data destinasi",
		})
		return
	}

	go func() {
		_, err := http.Post(
			"http://localhost:8000/reload-destinations",
			"application/json",
			nil,
		)

		if err != nil {
			log.Println("reload cache gagal:", err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"message": "data destinasi berhasil dihapus",
	})
}

// ============================
// GET RANDOM DESTINASI (Untuk Cold Start Wisatawan)
// ============================
func GetRandomDestinasi(c *gin.Context) {
	var destinasiList []models.Destinasi

	// Mengambil 6 destinasi secara acak
	if err := config.DB.
		Order("RANDOM()").
		Limit(6).
		Find(&destinasiList).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil rekomendasi destinasi",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "rekomendasi destinasi acak berhasil diambil",
		"data":    destinasiList,
	})
}

// ============================
// IMPORT DESTINASI VIA CSV
// ============================
func ImportDestinasiCSV(c *gin.Context) {
	// 1. Tangkap file dari request multipart form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file CSV tidak ditemukan"})
		return
	}

	// 2. Buka file yang diunggah
	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuka file"})
		return
	}
	defer f.Close()

	// 3. Baca isi CSV
	reader := csv.NewReader(f)
	records, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format CSV tidak valid atau rusak"})
		return
	}

	var successCount int
	var failCount int

	// 4. Looping setiap baris data (Record)
	for i, row := range records {
		// Abaikan baris pertama jika itu adalah baris Header (Nama kolom)
		if i == 0 && strings.ToLower(row[0]) == "nama" {
			continue
		}

		// Pastikan jumlah kolom sesuai format minimal (7 kolom)
		if len(row) < 7 {
			failCount++
			continue
		}

		// Konversi tipe data Latitude dan Longitude dari String ke Float64
		lat, errLat := strconv.ParseFloat(strings.TrimSpace(row[5]), 64)
		lon, errLon := strconv.ParseFloat(strings.TrimSpace(row[6]), 64)

		if errLat != nil || errLon != nil {
			failCount++
			continue
		}

		deskripsiAsli := strings.TrimSpace(row[1])

		// Siapkan struct Destinasi baru
		destinasi := models.Destinasi{
			Nama:           strings.TrimSpace(row[0]),
			Deskripsi:      deskripsiAsli,
			DeskripsiClean: getCleanTextFromPython(deskripsiAsli), // 👈 Ambil clean text untuk data CSV
			Alamat:         strings.TrimSpace(row[2]),
			Kota:           strings.TrimSpace(row[3]),
			Kategori:       strings.TrimSpace(row[4]),
			Latitude:       lat,
			Longitude:      lon,
			// Kolom petugas dibiarkan kosong agar statusnya otomatis "Dikelola oleh Admin"
		}

		// Simpan ke database
		if err := config.DB.Create(&destinasi).Error; err != nil {
			failCount++
		} else {
			successCount++
		}

		go func() {
			_, err := http.Post(
				"http://localhost:8000/reload-destinations",
				"application/json",
				nil,
			)

			if err != nil {
				log.Println("reload cache gagal:", err)
			}
		}()
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Proses import CSV selesai",
		"success_count": successCount,
		"fail_count":    failCount,
	})
}

func GetDestinasiForAI(c *gin.Context) {

	var destinasi []models.Destinasi

	if err := config.DB.Find(&destinasi).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil destinasi",
		})
		return
	}

	var result []DestinasiAI

	for _, d := range destinasi {
		result = append(result, DestinasiAI{
			ID:        d.ID,
			Nama:      d.Nama,
			Kategori:  d.Kategori,
			Deskripsi: d.Deskripsi,
			Latitude:  d.Latitude,
			Longitude: d.Longitude,
		})
	}

	c.JSON(http.StatusOK, result)
}

func GetDestinasiByID(c *gin.Context) {
	id := c.Param("id")

	destID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var destinasi models.Destinasi

	if err := config.DB.
		First(&destinasi, "id = ?", destID).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "destinasi tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, destinasi)
}
