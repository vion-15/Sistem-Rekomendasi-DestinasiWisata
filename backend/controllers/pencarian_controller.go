package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"backend-wisata/config"
	"backend-wisata/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ============================
// STRUCT REQUEST DARI FRONTEND
// ============================
type SearchInput struct {
	WisatawanID string `json:"id_wisatawan" binding:"required"`
	Keyword     string `json:"keyword" binding:"required"`
}

type PythonRequest struct {
	UserHistoryText string `json:"user_history_text"`
	TopN            int    `json:"top_n"`
}

type AdminSearchInput struct {
	AdminID string `json:"id_admin"`
	Keyword string `json:"keyword"`
}

type PetugasSearchInput struct {
	PetugasID string `json:"id_petugas"`
	Keyword   string `json:"keyword"`
}

type RecommendationResponse struct {
	Recommendations []Recommendation `json:"recommendations"`
}

type Recommendation struct {
	ID              string  `json:"id"`
	SimilarityScore float64 `json:"similarity_score"`
}

// ============================
// CARI DESTINASI (CBF)
// ============================
func CariDestinasiCBF(c *gin.Context) {
	var input SearchInput

	// ============================
	// 1. VALIDASI INPUT
	// ============================
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id_wisatawan dan keyword wajib diisi",
		})
		return
	}

	wisatawanID, err := uuid.Parse(input.WisatawanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_wisatawan tidak valid",
		})
		return
	}

	keyword := strings.TrimSpace(input.Keyword)

	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "keyword tidak boleh kosong",
		})
		return
	}

	// ============================
	// 2. CEK WISATAWAN ADA
	// ============================
	var wisatawan models.Wisatawan

	if err := config.DB.
		Where("id = ?", wisatawanID).
		First(&wisatawan).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "wisatawan tidak ditemukan",
		})
		return
	}

	// ============================
	// 3. SIMPAN RIWAYAT PENCARIAN
	// ============================
	riwayat := models.RiwayatPencarian{
		WisatawanID: wisatawanID,
		Keyword:     keyword,
	}

	if err := config.DB.Create(&riwayat).Error; err != nil {
		log.Printf(
			"Gagal menyimpan riwayat pencarian wisatawan %s: %v",
			wisatawanID.String(),
			err,
		)
	}

	userHistoryText := keyword

	pythonReqData := PythonRequest{
		UserHistoryText: userHistoryText,
		TopN:            10,
	}

	jsonData, err := json.Marshal(pythonReqData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menyiapkan data untuk service AI",
		})
		return
	}

	// ============================
	// 7. REQUEST KE FASTAPI
	// ============================
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	recommendationURL := os.Getenv("RECOMMENDATION_URL")

	fmt.Println("=== MENCOBA MENGHUBUNGI AI ===")
	fmt.Println("URL:", recommendationURL)

	resp, err := client.Post(
		recommendationURL+"/recommend",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	if err != nil {
		fmt.Println("=== ERROR KONEKSI KE AI ===")
		fmt.Println("Detail Error:", err.Error())

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "service rekomendasi sedang tidak tersedia",
			"detail": err.Error(), // <--- INI KUNCI UTAMANYA
		})
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "service rekomendasi mengembalikan response tidak valid",
		})
		return
	}

	// ============================
	// 8. BACA RESPONSE FASTAPI
	// ============================
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal membaca hasil rekomendasi",
		})
		return
	}

	var result RecommendationResponse

	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal membaca response rekomendasi",
		})
		return
	}

	config.DB.
		Where("wisatawan_id = ?", wisatawanID).
		Delete(&models.HasilRekomendasi{})

	for _, item := range result.Recommendations {

		destinasiID, err := uuid.Parse(item.ID)
		if err != nil {
			continue
		}

		hasil := models.HasilRekomendasi{
			WisatawanID:     wisatawanID,
			DestinasiID:     destinasiID,
			SimilarityScore: item.SimilarityScore,
		}

		if err := config.DB.Create(&hasil).Error; err != nil {
			log.Printf(
				"Gagal menyimpan hasil rekomendasi %s: %v",
				destinasiID.String(),
				err,
			)
		}
	}

	// ============================
	// 9. KIRIM KE FRONTEND
	// ============================
	c.Data(
		http.StatusOK,
		"application/json",
		bodyBytes,
	)
}

// ============================
// REKOMENDASI DASHBOARD (PERSONALIZED)
// ============================
func RekomendasiDashboardCBF(c *gin.Context) {

	wisatawanIDParam := c.Param("id")

	wisatawanID, err := uuid.Parse(wisatawanIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_wisatawan tidak valid",
		})
		return
	}

	var profileBuilder strings.Builder

	var riwayatPencarian []models.RiwayatPencarian

	config.DB.
		Where("wisatawan_id = ?", wisatawanID).
		Order("created_at DESC").
		Limit(10).
		Find(&riwayatPencarian)

	for _, rp := range riwayatPencarian {
		profileBuilder.WriteString(rp.Keyword)
		profileBuilder.WriteString(" ")
	}

	var riwayatDestinasi []models.RiwayatDestinasi

	config.DB.
		Preload("Destinasi").
		Where("wisatawan_id = ?", wisatawanID).
		Order("created_at DESC").
		Limit(10).
		Find(&riwayatDestinasi)

	for _, rd := range riwayatDestinasi {

		if rd.Destinasi.ID == uuid.Nil {
			continue
		}

		profileBuilder.WriteString(rd.Destinasi.Nama)
		profileBuilder.WriteString(" ")

		profileBuilder.WriteString(rd.Destinasi.Kategori)
		profileBuilder.WriteString(" ")

		profileBuilder.WriteString(rd.Destinasi.Deskripsi)
		profileBuilder.WriteString(" ")
	}

	userHistoryText := strings.TrimSpace(
		profileBuilder.String(),
	)

	if userHistoryText == "" {

		var randomDestinasi []models.Destinasi

		if err := config.DB.
			Order("RANDOM()").
			Limit(6).
			Find(&randomDestinasi).Error; err != nil {

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal mengambil destinasi acak",
			})
			return
		}

		var recommendations []map[string]interface{}

		for _, dest := range randomDestinasi {

			recommendations = append(
				recommendations,
				map[string]interface{}{
					"id": dest.ID.String(),

					// Indonesia
					"nama":      dest.Nama,
					"kategori":  dest.Kategori,
					"deskripsi": dest.Deskripsi,
					"kota":      dest.Kota,

					// English
					"nama_en":      dest.NamaEn,
					"kategori_en":  dest.KategoriEn,
					"deskripsi_en": dest.DeskripsiEn,
					"kota_en":      dest.KotaEn,

					"latitude":         dest.Latitude,
					"longitude":        dest.Longitude,
					"gambar":           dest.Gambar,
					"similarity_score": 1.0,
				},
			)
		}

		c.JSON(http.StatusOK, gin.H{
			"recommendations": recommendations,
		})

		return
	}

	pythonReqData := PythonRequest{
		UserHistoryText: userHistoryText,
		TopN:            20,
	}

	jsonData, err := json.Marshal(
		pythonReqData,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menyiapkan data AI",
		})
		return
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	recommendationURL := os.Getenv("RECOMMENDATION_URL")

	resp, err := client.Post(
		recommendationURL+"/recommend",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	if err != nil {
		// Saya tambahkan log error aslinya agar ke depannya gampang di-debug
		log.Printf("ERROR CALL FASTAPI: %v\n", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "service rekomendasi sedang tidak tersedia",
			"detail": err.Error(),
		})
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "service rekomendasi mengembalikan response tidak valid",
		})

		return
	}

	bodyBytes, err := io.ReadAll(resp.Body)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal membaca hasil rekomendasi",
		})
		return
	}

	var pythonResponse struct {
		Recommendations []struct {
			ID              string  `json:"id"`
			SimilarityScore float64 `json:"similarity_score"`
		} `json:"recommendations"`
	}

	err = json.Unmarshal(bodyBytes, &pythonResponse)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal parsing response AI",
		})
		return
	}

	var recommendations []map[string]interface{}

	for _, item := range pythonResponse.Recommendations {

		destID, err := uuid.Parse(item.ID)

		if err != nil {
			continue
		}

		var destinasi models.Destinasi

		err = config.DB.
			Where("id = ?", destID).
			First(&destinasi).
			Error

		if err != nil {
			continue
		}

		recommendations = append(
			recommendations,
			map[string]interface{}{
				"id": destinasi.ID.String(),

				// Indonesia
				"nama":      destinasi.Nama,
				"kategori":  destinasi.Kategori,
				"deskripsi": destinasi.Deskripsi,
				"kota":      destinasi.Kota,

				// English
				"nama_en":      destinasi.NamaEn,
				"kategori_en":  destinasi.KategoriEn,
				"deskripsi_en": destinasi.DeskripsiEn,
				"kota_en":      destinasi.KotaEn,

				"gambar":           destinasi.Gambar,
				"alamat":           destinasi.Alamat,
				"latitude":         destinasi.Latitude,
				"longitude":        destinasi.Longitude,
				"similarity_score": item.SimilarityScore,
			},
		)

	}

	c.JSON(http.StatusOK, gin.H{
		"recommendations": recommendations,
	})
}

func CariDestinasiAdminCBF(c *gin.Context) {
	var input AdminSearchInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id_admin dan keyword wajib diisi",
		})
		return
	}

	adminID, err := uuid.Parse(input.AdminID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_admin tidak valid",
		})
		return
	}

	keyword := strings.TrimSpace(input.Keyword)
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "keyword tidak boleh kosong",
		})
		return
	}

	var admin models.Admin
	if err := config.DB.Where("id = ?", adminID).First(&admin).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "admin tidak ditemukan",
		})
		return
	}

	userHistoryText := keyword

	pythonReqData := PythonRequest{
		UserHistoryText: userHistoryText,
		TopN:            10,
	}

	jsonData, err := json.Marshal(pythonReqData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menyiapkan data untuk service AI",
		})
		return
	}

	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	recommendationURL := os.Getenv("RECOMMENDATION_URL")

	resp, err := client.Post(
		recommendationURL+"/recommend",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	if err != nil {
		// Saya tambahkan log error aslinya agar ke depannya gampang di-debug
		log.Printf("ERROR CALL FASTAPI: %v\n", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "service rekomendasi sedang tidak tersedia",
			"detail": err.Error(),
		})
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "service rekomendasi mengembalikan response tidak valid",
		})
		return
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal membaca hasil rekomendasi",
		})
		return
	}

	c.Data(
		http.StatusOK,
		"application/json",
		bodyBytes,
	)
}

func CariDestinasiPetugasCBF(c *gin.Context) {
	var input PetugasSearchInput

	// ============================
	// 1. VALIDASI INPUT
	// ============================
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id_petugas dan keyword wajib diisi",
		})
		return
	}

	petugasID, err := uuid.Parse(input.PetugasID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_petugas tidak valid",
		})
		return
	}

	keyword := strings.TrimSpace(input.Keyword)
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "keyword tidak boleh kosong",
		})
		return
	}

	// ============================
	// 2. CEK Petugas ADA (Opsional)
	// ============================
	var petugas models.Petugas // Sesuaikan dengan nama model Admin Anda jika ada
	if err := config.DB.Where("id = ?", petugasID).First(&petugas).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "petugas tidak ditemukan",
		})
		return
	}

	// Note: Langkah menyimpan riwayat pencarian wisatawan dilewati
	// karena ini dilakukan oleh petugas untuk keperluan monitoring/testing.

	userHistoryText := keyword

	pythonReqData := PythonRequest{
		UserHistoryText: userHistoryText,
		TopN:            10,
	}

	jsonData, err := json.Marshal(pythonReqData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menyiapkan data untuk service AI",
		})
		return
	}

	// ============================
	// 3. REQUEST KE FASTAPI
	// ============================
	client := &http.Client{
		Timeout: 60 * time.Second,
	}

	recommendationURL := os.Getenv("RECOMMENDATION_URL")

	resp, err := client.Post(
		recommendationURL+"/recommend",
		"application/json",
		bytes.NewBuffer(jsonData),
	)

	if err != nil {
		// Saya tambahkan log error aslinya agar ke depannya gampang di-debug
		log.Printf("ERROR CALL FASTAPI: %v\n", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "service rekomendasi sedang tidak tersedia",
			"detail": err.Error(),
		})
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "service rekomendasi mengembalikan response tidak valid",
		})
		return
	}

	// ============================
	// 4. BACA & KIRIM RESPONSE
	// ============================
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal membaca hasil rekomendasi",
		})
		return
	}

	c.Data(
		http.StatusOK,
		"application/json",
		bodyBytes,
	)
}

func GetHasilRekomendasi(c *gin.Context) {

	id := c.Param("id")

	wisatawanID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id wisatawan tidak valid",
		})
		return
	}

	var hasil []models.HasilRekomendasi

	err = config.DB.
		Preload("Destinasi").
		Where("wisatawan_id = ?", wisatawanID).
		Order("similarity_score DESC").
		Find(&hasil).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil hasil rekomendasi",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "hasil rekomendasi berhasil diambil",
		"total":   len(hasil),
		"data":    hasil,
	})
}

func GetPencarian(c *gin.Context) {

	id := c.Param("id")

	wisatawanID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id wisatawan tidak valid",
		})
		return
	}

	var riwayat []models.RiwayatPencarian

	err = config.DB.
		Where("wisatawan_id = ?", wisatawanID).
		Order("created_at DESC").
		Find(&riwayat).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil riwayat pencarian",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "riwayat berhasil diambil",
		"total":   len(riwayat),
		"data":    riwayat,
	})
}
