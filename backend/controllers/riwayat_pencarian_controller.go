package controllers

import (
	"net/http"

	"backend-wisata/config"
	"backend-wisata/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ============================
// GET RIWAYAT PENCARIAN
// ============================
func GetRiwayatPencarianByWisatawan(c *gin.Context) {
	wisatawanID := c.Param("id_wisatawan")

	parsedID, err := uuid.Parse(wisatawanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_wisatawan tidak valid",
		})
		return
	}

	var riwayatList []models.RiwayatPencarian

	if err := config.DB.
		Where("wisatawan_id = ?", parsedID).
		Order("created_at DESC").
		Find(&riwayatList).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil data riwayat pencarian",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "riwayat pencarian berhasil diambil",
		"total":   len(riwayatList),
		"data":    riwayatList,
	})
}

// ============================
// DELETE RIWAYAT PENCARIAN
// ============================
func DeleteRiwayatPencarian(c *gin.Context) {
	riwayatID := c.Param("id")

	parsedID, err := uuid.Parse(riwayatID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id riwayat tidak valid",
		})
		return
	}

	result := config.DB.
		Where("id = ?", parsedID).
		Delete(&models.RiwayatPencarian{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus riwayat pencarian",
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "riwayat pencarian tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "riwayat pencarian berhasil dihapus",
	})
}

func DeleteAllRiwayatPencarian(c *gin.Context) {
	wisatanID := c.Param("id_wisatawan")

	parsedID, err := uuid.Parse(wisatanID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format id_wisatawan tidak valid",
		})
		return
	}

	var wisatawan models.Wisatawan

	if err := config.DB.First(&wisatawan, "id = ?", parsedID).Error; err != nil {
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

	result := config.DB.Where("wisatawan_id = ?", parsedID).Delete(&models.RiwayatPencarian{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus seluruh riwayat pencarian",
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "tidak ada riwayat pencarian yang dapat dihapus",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "seluruh riwayat pencarian berhasil dihapus",
		"deleted": result.RowsAffected,
	})
}
