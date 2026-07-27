package controllers

import (
	"net/http"

	"backend-wisata/config"
	"backend-wisata/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Struct untuk menangkap request simpan riwayat
type RiwayatDestinasiInput struct {
	WisatawanID string `json:"id_wisatawan" binding:"required"`
	DestinasiID string `json:"id_destinasi" binding:"required"`
}

// ============================
// SIMPAN RIWAYAT DESTINASI
// ============================
func SimpanRiwayatDestinasi(c *gin.Context) {

	var input RiwayatDestinasiInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "data tidak valid",
		})
		return
	}

	wisatawanID, err := uuid.Parse(input.WisatawanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id wisatawan tidak valid",
		})
		return
	}

	destinasiID, err := uuid.Parse(input.DestinasiID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id destinasi tidak valid",
		})
		return
	}

	riwayat := models.RiwayatDestinasi{
		WisatawanID: wisatawanID,
		DestinasiID: destinasiID,
	}

	if err := config.DB.Create(&riwayat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menyimpan riwayat destinasi",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "riwayat destinasi berhasil disimpan",
	})
}

// ============================
// GET RIWAYAT DESTINASI
// ============================
func GetRiwayatDestinasiByWisatawan(c *gin.Context) {
	wisatawanID := c.Param("id_wisatawan")

	parsedID, err := uuid.Parse(wisatawanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_wisatawan tidak valid",
		})
		return
	}

	// Pastikan wisatawan ada
	var wisatawan models.Wisatawan

	if err := config.DB.
		First(&wisatawan, "id = ?", parsedID).
		Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "wisatawan tidak ditemukan",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal memverifikasi wisatawan",
		})
		return
	}

	var riwayatList []models.RiwayatDestinasi

	if err := config.DB.
		Preload("Destinasi").
		Where("wisatawan_id = ?", parsedID).
		Order("created_at DESC").
		Find(&riwayatList).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil data riwayat destinasi",
		})
		return
	}

	var result []gin.H

	for _, item := range riwayatList {

		var ulasan models.Ulasan

		err := config.DB.
			Where(
				"wisatawan_id = ? AND destinasi_id = ?",
				parsedID,
				item.DestinasiID,
			).
			First(&ulasan).
			Error

		data := gin.H{
			"id":        item.ID,
			"destinasi": item.Destinasi,
		}

		if err == nil {

			data["rating"] = ulasan.Rating
			data["ulasan"] = ulasan.Komentar
			data["tanggal_ulasan"] = ulasan.CreatedAt

		}

		result = append(result, data)

	}

	c.JSON(http.StatusOK, gin.H{
		"message": "riwayat destinasi berhasil diambil",
		"total":   len(result),
		"data":    result,
	})
}

func DeleteRiwayatDestinasi(c *gin.Context) {

	id := c.Param("id")

	riwayatID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id riwayat tidak valid",
		})
		return
	}

	// Ambil data riwayat
	var riwayat models.RiwayatDestinasi

	if err := config.DB.
		Where("id = ?", riwayatID).
		First(&riwayat).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "riwayat tidak ditemukan",
		})
		return
	}

	// Hapus ulasan jika ada
	config.DB.
		Where(
			"wisatawan_id = ? AND destinasi_id = ?",
			riwayat.WisatawanID,
			riwayat.DestinasiID,
		).
		Delete(&models.Ulasan{})

	// Hapus riwayat destinasi
	if err := config.DB.
		Delete(&riwayat).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus riwayat destinasi",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "riwayat destinasi berhasil dihapus",
	})
}

func DeleteAllRiwayatDestinasi(c *gin.Context) {
	wisatawanID := c.Param("id_wisatawan")

	parsedID, err := uuid.Parse(wisatawanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_wisatawan tidak valid",
		})
		return
	}

	var wisatawan models.Wisatawan

	if err := config.DB.
		First(&wisatawan, "id = ?", parsedID).
		Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "wisatawan tidak ditemukan",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal memverifikasi wisatawan",
		})
		return
	}

	// Hard delete seluruh riwayat destinasi milik wisatawan
	result := config.DB.
		Where("wisatawan_id = ?", parsedID).
		Delete(&models.RiwayatDestinasi{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus seluruh riwayat destinasi",
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "tidak ada riwayat destinasi yang dapat dihapus",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "seluruh riwayat destinasi berhasil dihapus",
		"deleted": result.RowsAffected,
	})
}
