package controllers

import (
	"net/http"

	"backend-wisata/config"
	"backend-wisata/models"

	"github.com/gin-gonic/gin"
)

func GetWisatawan(c *gin.Context) {
	var wisatawanList []models.Wisatawan

	err := config.DB.
		Select("id", "username", "email", "foto", "alamat", "created_at").
		Order("created_at DESC").
		Find(&wisatawanList).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil data wisatawan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data wisatawan berhasil diambil",
		"total":   len(wisatawanList),
		"data":    wisatawanList,
	})
}

func DeleteWisatawan(c *gin.Context) {
	id := c.Param("id")

	var wisatawan models.Wisatawan

	if err := config.DB.First(&wisatawan, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "wisatawan tidak ditemukan",
		})
		return
	}

	if err := config.DB.Delete(&wisatawan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus wisatawan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "wisatawan berhasil dihapus",
	})
}
