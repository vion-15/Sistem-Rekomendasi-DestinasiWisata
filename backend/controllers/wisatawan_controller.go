package controllers

import (
	"net/http"
	"strings"

	"backend-wisata/config"
	"backend-wisata/models"
	"backend-wisata/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func GetWisatawan(c *gin.Context) {
	var wisatawanList []models.Wisatawan

	err := config.DB.
		Select("id", "username", "email", "foto", "created_at").
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

	tx := config.DB.Begin()

	tx.Where("wisatawan_id = ?", wisatawan.ID).
		Delete(&models.Ulasan{})

	tx.Where("wisatawan_id = ?", wisatawan.ID).
		Delete(&models.RiwayatDestinasi{})

	tx.Where("wisatawan_id = ?", wisatawan.ID).
		Delete(&models.RiwayatPencarian{})

	// Jika ada tabel hasil rekomendasi
	tx.Where("wisatawan_id = ?", wisatawan.ID).
		Delete(&models.HasilRekomendasi{})

	if err := tx.Delete(&wisatawan).Error; err != nil {
		tx.Rollback()

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus wisatawan",
		})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"message": "wisatawan berhasil dihapus",
	})
}

func GetWisatawanByID(c *gin.Context) {

	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID wisatawan tidak valid",
		})
		return
	}

	var wisatawan models.Wisatawan

	if err := config.DB.
		First(&wisatawan, "id = ?", parsedID).
		Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Wisatawan tidak ditemukan",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal mengambil data wisatawan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data wisatawan berhasil diambil",
		"data":    wisatawan,
	})
}

func UpdateWisatawan(c *gin.Context) {

	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID wisatawan tidak valid",
		})
		return
	}

	var wisatawan models.Wisatawan

	if err := config.DB.
		First(&wisatawan, "id = ?", parsedID).
		Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Wisatawan tidak ditemukan",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal mengambil data wisatawan",
		})
		return
	}

	username := strings.TrimSpace(c.PostForm("username"))
	email := strings.TrimSpace(c.PostForm("email"))
	password := c.PostForm("password")

	if username == "" || email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username dan email wajib diisi",
		})
		return
	}

	if !strings.Contains(email, "@") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Format email tidak valid",
		})
		return
	}

	// Cek email jika diubah
	if email != wisatawan.Email {

		var existing models.Wisatawan

		if err := config.DB.
			Where("email = ? AND id <> ?", email, parsedID).
			First(&existing).Error; err == nil {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Email sudah digunakan",
			})
			return
		}
	}

	wisatawan.Username = username
	wisatawan.Email = email

	// Password opsional
	if password != "" {

		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(password),
			bcrypt.DefaultCost,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Gagal hashing password",
			})
			return
		}

		wisatawan.Password = string(hashedPassword)
	}

	// Foto opsional
	fileHeader, err := c.FormFile("foto")

	if err == nil {

		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Gagal membaca file foto",
			})
			return
		}
		defer file.Close()

		fotoURL, err := utils.UploadImage(file, "wisata_profiles/wisatawan")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Upload foto gagal: " + err.Error(),
			})
			return
		}

		wisatawan.Foto = fotoURL
	}

	if err := config.DB.Save(&wisatawan).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal mengupdate data wisatawan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data wisatawan berhasil diperbarui",
		"data": gin.H{
			"id":       wisatawan.ID,
			"username": wisatawan.Username,
			"email":    wisatawan.Email,
			"foto":     wisatawan.Foto,
		},
	})
}
