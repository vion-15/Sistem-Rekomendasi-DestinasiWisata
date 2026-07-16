package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"net/url"
	"strings"

	"backend-wisata/config"
	"backend-wisata/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// ============================
// GET ALL WISATAWAN (Admin Only)
// ============================
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

func RegisterWisatawan(c *gin.Context) {
	// Ambil dan bersihkan input
	username := strings.TrimSpace(c.PostForm("username"))
	email := strings.ToLower(strings.TrimSpace(c.PostForm("email")))
	password := c.PostForm("password")
	alamat := strings.TrimSpace(c.PostForm("alamat"))

	// Validasi field wajib
	if username == "" || email == "" || password == "" || alamat == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "semua field wajib diisi",
		})
		return
	}

	// Validasi username
	if len(username) < 3 || len(username) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "username harus 3-50 karakter",
		})
		return
	}

	// Validasi email
	if _, err := mail.ParseAddress(email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format email tidak valid",
		})
		return
	}

	// Validasi password
	if len(password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "password minimal 8 karakter",
		})
		return
	}

	// Batas bcrypt
	if len(password) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "password maksimal 72 karakter",
		})
		return
	}

	// Validasi alamat
	if len(alamat) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "alamat terlalu pendek",
		})
		return
	}

	// Cek email duplikat
	var existing models.Wisatawan

	err := config.DB.
		Where("email = ?", email).
		First(&existing).Error

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "email sudah terdaftar",
		})
		return
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal memeriksa email",
		})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal memproses password",
		})
		return
	}

	// Avatar default
	fotoDefault := fmt.Sprintf(
		"https://ui-avatars.com/api/?name=%s&background=random",
		url.QueryEscape(username),
	)

	// Simpan data
	wisatawan := models.Wisatawan{
		Username: username,
		Email:    email,
		Password: string(hashedPassword),
		Alamat:   alamat,
		Foto:     fotoDefault,
	}

	if err := config.DB.Create(&wisatawan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal melakukan registrasi",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "registrasi berhasil, silakan login",
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
