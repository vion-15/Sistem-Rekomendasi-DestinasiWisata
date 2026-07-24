package controllers

import (
	"errors"
	"net/http"
	"net/mail"
	"strings"

	"backend-wisata/config"
	"backend-wisata/models"
	"backend-wisata/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginInput struct {
	Email    string `json:"email" form:"email" binding:"required,email"`
	Password string `json:"password" form:"password" binding:"required"`
}

func LoginUniversal(c *gin.Context) {
	var input LoginInput

	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "email atau password tidak valid",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(input.Email))
	password := input.Password

	var admin models.Admin

	err := config.DB.
		Where("email = ?", email).
		First(&admin).Error

	if err == nil {
		if bcrypt.CompareHashAndPassword(
			[]byte(admin.Password),
			[]byte(password),
		) == nil {

			token, err := utils.GenerateToken(
				admin.ID.String(),
				"admin",
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "gagal membuat session token",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "login berhasil",
				"role":    "admin",
				"token":   token,
				"data": gin.H{
					"id":       admin.ID,
					"username": admin.Username,
					"email":    admin.Email,
					"foto":     admin.Foto,
				},
			})
			return
		}
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "terjadi kesalahan server",
		})
		return
	}

	var petugas models.Petugas

	err = config.DB.
		Where("email = ?", email).
		First(&petugas).Error

	if err == nil {
		if bcrypt.CompareHashAndPassword(
			[]byte(petugas.Password),
			[]byte(password),
		) == nil {

			token, err := utils.GenerateToken(
				petugas.ID.String(),
				"petugas",
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "gagal membuat session token",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "login berhasil",
				"role":    "petugas",
				"token":   token,
				"data": gin.H{
					"id":       petugas.ID,
					"username": petugas.Username,
					"email":    petugas.Email,
					"foto":     petugas.Foto,
				},
			})
			return
		}
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "terjadi kesalahan server",
		})
		return
	}

	var wisatawan models.Wisatawan

	err = config.DB.
		Where("email = ?", email).
		First(&wisatawan).Error

	if err == nil {
		if bcrypt.CompareHashAndPassword(
			[]byte(wisatawan.Password),
			[]byte(password),
		) == nil {

			token, err := utils.GenerateToken(
				wisatawan.ID.String(),
				"wisatawan",
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "gagal membuat session token",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "login berhasil",
				"role":    "wisatawan",
				"token":   token,
				"data": gin.H{
					"id":       wisatawan.ID,
					"username": wisatawan.Username,
					"email":    wisatawan.Email,
					"foto":     wisatawan.Foto,
				},
			})
			return
		}
	}

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "terjadi kesalahan server",
		})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{
		"error": "email atau password salah",
	})
}

func RegisterWisatawan(c *gin.Context) {
	username := strings.TrimSpace(c.PostForm("username"))
	email := strings.ToLower(strings.TrimSpace(c.PostForm("email")))
	password := c.PostForm("password")
	alamat := strings.TrimSpace(c.PostForm("alamat"))

	if username == "" || email == "" || password == "" || alamat == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "semua field wajib diisi",
		})
		return
	}

	if len(username) < 3 || len(username) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "username harus 3-50 karakter",
		})
		return
	}

	if _, err := mail.ParseAddress(email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format email tidak valid",
		})
		return
	}

	if len(password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "password minimal 8 karakter",
		})
		return
	}

	if len(password) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "password maksimal 72 karakter",
		})
		return
	}

	if len(alamat) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "alamat terlalu pendek",
		})
		return
	}

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

	fotoDefault := "http://localhost:8080/images/default-avatar.png"

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
