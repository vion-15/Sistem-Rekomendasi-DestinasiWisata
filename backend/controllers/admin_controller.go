package controllers

import (
	"backend-wisata/config"
	"backend-wisata/models"
	"net/http"
	"net/mail"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"backend-wisata/utils"
)

func GetAdmin(c *gin.Context) {
	var adminList []models.Admin

	if err := config.DB.Select("id, username, email, foto, created_at").
		Find(&adminList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil data admin",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": adminList,
	})
}

func GetAdminByID(c *gin.Context) {
	id := c.Param("id")

	adminID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var admin models.Admin

	if err := config.DB.
		Select("id, username, email, foto, created_at").
		First(&admin, "id = ?", adminID).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "admin tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data admin berhasil diambil",
		"data":    admin,
	})
}

func CreateAdmin(c *gin.Context) {
	username := strings.TrimSpace(c.PostForm("username"))
	email := strings.TrimSpace(c.PostForm("email"))
	password := c.PostForm("password")

	if username == "" || email == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "username, email, & password wajib diisi",
		})
		return
	}

	if !strings.Contains(email, "@") {
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

	var existing models.Admin

	if err := config.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "email sudah terdaftar",
		})
		return
	}

	var fotoURL string

	fileHeader, err := c.FormFile("foto")
	if err == nil {
		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal membuka file foto",
			})
			return
		}
		defer file.Close()

		fotoURL, err = utils.UploadImage(file, "admins")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal upload foto",
			})
			return
		}
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal hashing password",
		})
		return
	}

	admin := models.Admin{
		Username: username,
		Email:    email,
		Password: string(hashedPassword),
		Foto:     fotoURL,
	}

	if err := config.DB.Create(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menyimpan admin ke database",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "admin berhasil ditambahkan",
		"data": gin.H{
			"id":       admin.ID,
			"username": admin.Username,
			"email":    admin.Email,
			"foto":     admin.Foto,
		},
	})
}

func UpdateAdmin(c *gin.Context) {
	id := c.Param("id")

	adminID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var admin models.Admin

	if err := config.DB.First(&admin, "id = ?", adminID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "data admin tidak ditemukan",
		})
		return
	}

	username := strings.TrimSpace(c.PostForm("username"))
	email := strings.TrimSpace(c.PostForm("email"))
	password := c.PostForm("password")

	if username != "" {
		admin.Username = username
	}

	if email != "" && email != admin.Email {

		if _, err := mail.ParseAddress(email); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "format email tidak valid",
			})
			return
		}

		var existing models.Admin

		if err := config.DB.Where("email = ? AND id <> ?", email, admin.ID).First(&existing).Error; err == nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "email sudah digunakan oleh akun lain",
			})
			return
		}

		admin.Email = email
	}

	if password != "" {

		if len(password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "password minimal 8 karakter",
			})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(password),
			bcrypt.DefaultCost,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal hashing password",
			})
			return
		}

		admin.Password = string(hashedPassword)
	}

	fileHeader, err := c.FormFile("foto")
	if err == nil {

		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal membuka file foto",
			})
			return
		}
		defer file.Close()

		// Hapus foto lama jika ada
		if admin.Foto != "" {
			if err := utils.DeleteImageByURL(admin.Foto); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "gagal menghapus foto lama",
				})
				return
			}
		}

		// Upload foto baru
		fotoURL, err := utils.UploadImage(file, "admins")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal upload foto baru",
			})
			return
		}

		admin.Foto = fotoURL
	}

	if err := config.DB.Save(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengupdate data admin",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data admin berhasil di update",
		"data": gin.H{
			"id":       admin.ID,
			"username": admin.Username,
			"email":    admin.Email,
			"foto":     admin.Foto,
		},
	})
}

func DeleteAdmin(c *gin.Context) {
	id := c.Param("id")

	adminID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var admin models.Admin

	if err := config.DB.First(&admin, "id = ?", adminID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "data admin tidak ditemukan",
		})
		return
	}

	if err := config.DB.Delete(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus data admin",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data admin berhasil dihapus",
	})
}
