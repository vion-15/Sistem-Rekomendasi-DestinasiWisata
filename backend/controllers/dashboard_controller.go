package controllers

import (
	"backend-wisata/config"
	"backend-wisata/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type DashboardResponse struct {
	TotalDestinasi int64 `json:"total_destinasi"`
	TotalWisatawan int64 `json:"total_wisatawan"`
	TotalPetugas   int64 `json:"total_petugas"`
	TotalUlasan    int64 `json:"total_ulasan"`
}

func GetDashboard(c *gin.Context) {

	var totalDestinasi int64
	var totalWisatawan int64
	var totalPetugas int64
	var totalUlasan int64

	config.DB.Model(&models.Destinasi{}).Count(&totalDestinasi)
	config.DB.Model(&models.Wisatawan{}).Count(&totalWisatawan)
	config.DB.Model(&models.Petugas{}).Count(&totalPetugas)
	config.DB.Model(&models.Ulasan{}).Count(&totalUlasan)

	dashboard := DashboardResponse{
		TotalDestinasi: totalDestinasi,
		TotalWisatawan: totalWisatawan,
		TotalPetugas:   totalPetugas,
		TotalUlasan:    totalUlasan,
	}

	c.JSON(http.StatusOK, gin.H{
		"data": dashboard,
	})
}
