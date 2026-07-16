package controllers

import (
	"errors"
	"net/http"
	"strings"

	"backend-wisata/config"
	"backend-wisata/models"
	"backend-wisata/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Struct untuk menampung request body dari frontend
type LoginInput struct {
	Email    string `json:"email" form:"email" binding:"required,email"`
	Password string `json:"password" form:"password" binding:"required"`
}

func LoginUniversal(c *gin.Context) {
	var input LoginInput

	// Bind dan validasi request
	if err := c.ShouldBind(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "email atau password tidak valid",
		})
		return
	}

	email := strings.ToLower(strings.TrimSpace(input.Email))
	password := input.Password

	// CEK ADMIN
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

	// CEK PETUGAS
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

	// CEK WISATAWAN
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

	// LOGIN GAGAL
	c.JSON(http.StatusUnauthorized, gin.H{
		"error": "email atau password salah",
	})
}
