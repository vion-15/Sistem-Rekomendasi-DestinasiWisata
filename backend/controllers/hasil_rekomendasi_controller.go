package controllers

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"backend-wisata/config"
	"backend-wisata/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var input SearchInput

var request PythonRequest

func CariDanSimpanRekomendasi(c *gin.Context) {
	var input SearchInput

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

	var wisatawan models.Wisatawan

	if err := config.DB.
		Where("id = ?", wisatawanID).
		First(&wisatawan).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "wisatawan tidak ditemukan",
		})
		return
	}

	riwayat := models.RiwayatPencarian{
		WisatawanID: wisatawanID,
		Keyword:     keyword,
	}

	if err := config.DB.Create(&riwayat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menyimpan riwayat pencarian",
		})
		return
	}

	userHistoryText := keyword

	pythonReq := PythonRequest{
		UserHistoryText: userHistoryText,
		TopN:            10,
	}

	jsonData, err := json.Marshal(pythonReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal membuat request AI",
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "service rekomendasi tidak tersedia",
		})
		return
	}

	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal membaca response AI",
		})
		return
	}

	c.Data(
		http.StatusOK,
		"application/json",
		bodyBytes,
	)
}
