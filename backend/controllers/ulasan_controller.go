package controllers

import (
	"net/http"

	"backend-wisata/config"
	"backend-wisata/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UlasanInput struct {
	WisatawanID string `json:"id_wisatawan" binding:"required"`
	DestinasiID string `json:"id_destinasi" binding:"required"`
	Rating      int    `json:"rating" binding:"required,min=1,max=5"`
	Komentar    string `json:"komentar" binding:"required"`
}

// ============================
// GET ALL ULASAN (Untuk Admin)
// ============================
func GetUlasan(c *gin.Context) {
	var ulasanList []models.Ulasan

	if err := config.DB.
		Preload("Destinasi").
		Preload("Wisatawan").
		Order("created_at DESC").
		Find(&ulasanList).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil data ulasan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data ulasan berhasil diambil",
		"total":   len(ulasanList),
		"data":    ulasanList,
	})
}

// ============================
// GET DETAIL ULASAN (Untuk Admin)
// ============================
func GetDetailUlasan(c *gin.Context) {
	id := c.Param("id")

	ulasanID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id ulasan tidak valid",
		})
		return
	}

	var ulasan models.Ulasan

	if err := config.DB.
		Preload("Destinasi").
		Preload("Wisatawan").
		First(&ulasan, "id = ?", ulasanID).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "data ulasan tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "detail ulasan berhasil diambil",
		"data":    ulasan,
	})
}

// ============================
// GET ULASAN BY WISATAWAN (Tambahan untuk Fitur Wisatawan)
// ============================
func GetUlasanByWisatawan(c *gin.Context) {
	wisatawanID := c.Param("id_wisatawan")

	parsedID, err := uuid.Parse(wisatawanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_wisatawan tidak valid",
		})
		return
	}

	var ulasanList []models.Ulasan

	// Preload Destinasi agar di frontend tahu ulasan ini milik tempat mana
	if err := config.DB.
		Preload("Destinasi").
		Where("wisatawan_id = ?", parsedID).
		Order("created_at DESC").
		Find(&ulasanList).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil data ulasan wisatawan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data ulasan wisatawan berhasil diambil",
		"total":   len(ulasanList),
		"data":    ulasanList,
	})
}

// ============================
// DELETE ULASAN
// (Moderasi oleh Admin / Hapus oleh Wisatawan)
// ============================
func DeleteUlasan(c *gin.Context) {
	id := c.Param("id")

	// Validasi UUID
	ulasanID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id ulasan tidak valid",
		})
		return
	}

	var ulasan models.Ulasan

	// Cek apakah data ada
	if err := config.DB.
		First(&ulasan, "id = ?", ulasanID).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "data ulasan tidak ditemukan",
		})
		return
	}

	// Soft Delete
	if err := config.DB.Delete(&ulasan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus data ulasan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "ulasan berhasil dihapus",
	})
}

// ============================
// CREATE ULASAN
// ============================
func CreateUlasan(c *gin.Context) {
	var input UlasanInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "semua field (id_wisatawan, id_destinasi, rating, komentar) wajib diisi dengan format yang benar"})
		return
	}

	wID, errW := uuid.Parse(input.WisatawanID)
	dID, errD := uuid.Parse(input.DestinasiID)

	if errW != nil || errD != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format UUID tidak valid"})
		return
	}

	ulasan := models.Ulasan{
		WisatawanID: wID,
		DestinasiID: dID,
		Rating:      input.Rating,
		Komentar:    input.Komentar,
	}

	if err := config.DB.Create(&ulasan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "gagal menyimpan ulasan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "ulasan berhasil disimpan",
		"data":    ulasan,
	})
}
