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
	"backend-wisata/helpers"
	"backend-wisata/models"
	"backend-wisata/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CleanRequest struct {
	Text string `json:"text"`
}

type CleanResponse struct {
	CleanedText string `json:"cleaned_text"`
}

type DestinasiAI struct {
	ID             uuid.UUID `json:"id"`
	Nama           string    `json:"nama"`
	Kategori       string    `json:"kategori"`
	Kota           string    `json:"kota"`
	Aktivitas      string    `json:"aktivitas"`
	AktivitasClean string    `json:"aktivitas_clean"`
	Deskripsi      string    `json:"deskripsi"`
	DeskripsiClean string    `json:"deskripsi_clean"`
	Latitude       float64   `json:"latitude"`
	Longitude      float64   `json:"longitude"`
}

func getCleanTextFromPython(text string) string {
	if text == "" {
		return ""
	}

	reqBody := CleanRequest{Text: text}
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		log.Printf("Error marshalling clean request: %v", err)
		return text
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

func CreateDestinasi(c *gin.Context) {
	nama := strings.TrimSpace(c.PostForm("nama"))
	deskripsi := strings.TrimSpace(c.PostForm("deskripsi"))
	aktivitas := strings.TrimSpace(c.PostForm("aktivitas"))
	alamat := strings.TrimSpace(c.PostForm("alamat"))
	kota := strings.TrimSpace(c.PostForm("kota"))
	kategori := strings.TrimSpace(c.PostForm("kategori"))
	idPetugasStr := strings.TrimSpace(c.PostForm("id_petugas"))
	latStr := strings.TrimSpace(c.PostForm("latitude"))
	lonStr := strings.TrimSpace(c.PostForm("longitude"))
	namaEn := strings.TrimSpace(c.PostForm("nama_en"))
	deskripsiEn := strings.TrimSpace(c.PostForm("deskripsi_en"))
	aktivitasEn := strings.TrimSpace(c.PostForm("aktivitas_en"))
	kotaEn := strings.TrimSpace(c.PostForm("kota_en"))
	kategoriEn := strings.TrimSpace(c.PostForm("kategori_en"))

	if nama == "" || deskripsi == "" || aktivitas == "" || alamat == "" || kota == "" || kategori == "" || latStr == "" || lonStr == "" {
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

		if err := config.DB.First(&petugas, "id = ?", parsedID).Error; err == nil {
			petugasID = &parsedID
		}
	}

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

	deskripsiClean := getCleanTextFromPython(deskripsi)
	aktivitasClean := getCleanTextFromPython(aktivitas)

	destinasi := models.Destinasi{
		Nama:           nama,
		NamaEn:         namaEn,
		Deskripsi:      deskripsi,
		DeskripsiEn:    deskripsiEn,
		DeskripsiClean: deskripsiClean,
		Aktivitas:      aktivitas,
		AktivitasEn:    aktivitasEn,
		AktivitasClean: aktivitasClean,
		Alamat:         alamat,
		Latitude:       lat,
		Longitude:      lon,
		Gambar:         gambarURL,
		Kota:           kota,
		KotaEn:         kotaEn,
		Kategori:       kategori,
		KategoriEn:     kategoriEn,
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

	config.DB.Preload("Petugas").First(&destinasi, "id = ?", destinasi.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "destinasi berhasil ditambahkan",
		"data":    destinasi,
	})
}

func GetDestinasi(c *gin.Context) {
	var destinasiList []models.Destinasi

	lang := c.DefaultQuery("lang", "id")

	if err := config.DB.Preload("Petugas").Find(&destinasiList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal mengambil data destinasi"})
		return
	}

	helpers.ApplyLanguageList(destinasiList, lang)

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
	aktivitas := strings.TrimSpace(c.PostForm("aktivitas"))
	alamat := strings.TrimSpace(c.PostForm("alamat"))
	kota := strings.TrimSpace(c.PostForm("kota"))
	kategori := strings.TrimSpace(c.PostForm("kategori"))
	idPetugasStr := strings.TrimSpace(c.PostForm("id_petugas"))
	latStr := strings.TrimSpace(c.PostForm("latitude"))
	lonStr := strings.TrimSpace(c.PostForm("longitude"))
	namaEn := strings.TrimSpace(c.PostForm("nama_en"))
	deskripsiEn := strings.TrimSpace(c.PostForm("deskripsi_en"))
	aktivitasEn := strings.TrimSpace(c.PostForm("aktivitas_en"))
	kotaEn := strings.TrimSpace(c.PostForm("kota_en"))
	kategoriEn := strings.TrimSpace(c.PostForm("kategori_en"))

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
		destinasi.DeskripsiClean = getCleanTextFromPython(deskripsi)
	}

	if aktivitas != "" {
		destinasi.Aktivitas = aktivitas
		destinasi.AktivitasClean = getCleanTextFromPython(aktivitas)
	}

	// Update alamat
	if alamat != "" {
		destinasi.Alamat = alamat
	}

	// Update kota
	if kota != "" {
		destinasi.Kota = kota
	}

	if namaEn != "" {
		destinasi.NamaEn = namaEn
	}

	if deskripsiEn != "" {
		destinasi.DeskripsiEn = deskripsiEn
	}

	if aktivitasEn != "" {
		destinasi.AktivitasEn = aktivitasEn
	}

	if kotaEn != "" {
		destinasi.KotaEn = kotaEn
	}

	if kategoriEn != "" {
		destinasi.KategoriEn = kategoriEn
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

func ImportDestinasiCSV(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file CSV tidak ditemukan"})
		return
	}

	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal membuka file"})
		return
	}
	defer f.Close()

	reader := csv.NewReader(f)
	records, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format CSV tidak valid atau rusak"})
		return
	}

	var successCount int
	var failCount int

	for i, row := range records {
		if i == 0 && strings.ToLower(row[0]) == "nama" {
			continue
		}

		if len(row) < 8 {
			failCount++
			continue
		}

		lat, errLat := strconv.ParseFloat(strings.TrimSpace(row[6]), 64)
		lon, errLon := strconv.ParseFloat(strings.TrimSpace(row[7]), 64)

		if errLat != nil || errLon != nil {
			failCount++
			continue
		}

		deskripsiAsli := strings.TrimSpace(row[1])
		aktivitasAsli := strings.TrimSpace(row[2])

		destinasi := models.Destinasi{
			Nama:           strings.TrimSpace(row[0]),
			Deskripsi:      deskripsiAsli,
			DeskripsiClean: getCleanTextFromPython(deskripsiAsli),
			Aktivitas:      aktivitasAsli,
			AktivitasClean: getCleanTextFromPython(aktivitasAsli),
			Alamat:         strings.TrimSpace(row[3]),
			Kota:           strings.TrimSpace(row[4]),
			Kategori:       strings.TrimSpace(row[5]),
			Latitude:       lat,
			Longitude:      lon,
		}

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
			ID:             d.ID,
			Nama:           d.Nama,
			Kategori:       d.Kategori,
			Kota:           d.Kota,
			Aktivitas:      d.Aktivitas,
			AktivitasClean: d.AktivitasClean,

			Deskripsi:      d.Deskripsi,
			DeskripsiClean: d.DeskripsiClean,
			Latitude:       d.Latitude,
			Longitude:      d.Longitude,
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
