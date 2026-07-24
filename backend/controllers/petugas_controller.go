package controllers

import (
	"net/http"
	"net/mail"
	"strings"

	"backend-wisata/config"
	"backend-wisata/models"
	"backend-wisata/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func CreatePetugas(c *gin.Context) {
	username := strings.TrimSpace(c.PostForm("username"))
	email := strings.TrimSpace(c.PostForm("email"))
	password := c.PostForm("password")

	if username == "" || email == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "username, email, password wajib diisi",
		})
		return
	}

	if !strings.Contains(email, "@") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "format email tidak valid",
		})
		return
	}

	var existing models.Petugas
	if err := config.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "email sudah terdaftar",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal hashing password",
		})
		return
	}

	fileHeader, err := c.FormFile("foto")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "foto profile wajib diunggah",
		})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal membaca file foto",
		})
		return
	}
	defer file.Close()

	fotoURL, err := utils.UploadImage(file, "wisata_profiles/petugas")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "upload foto gagal: " + err.Error(),
		})
		return
	}

	petugas := models.Petugas{
		Username: username,
		Email:    email,
		Password: string(hashedPassword),
		Foto:     fotoURL,
	}

	if err := config.DB.Create(&petugas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menyimpan petugas ke database",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "petugas berhasil ditambahkan",
		"data": gin.H{
			"id":       petugas.ID,
			"username": petugas.Username,
			"email":    petugas.Email,
			"foto":     petugas.Foto,
		},
	})
}

func GetPetugas(c *gin.Context) {
	var petugasList []models.Petugas

	if err := config.DB.
		Select("id, username, email, foto, created_at").
		Find(&petugasList).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengambil data petugas",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": petugasList,
	})
}

func UpdatePetugas(c *gin.Context) {
	id := c.Param("id")

	petugasID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var petugas models.Petugas

	if err := config.DB.First(&petugas, "id = ?", petugasID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "data petugas tidak ditemukan",
		})
		return
	}

	username := strings.TrimSpace(c.PostForm("username"))
	email := strings.TrimSpace(c.PostForm("email"))
	password := c.PostForm("password")

	var oldFoto string

	if username != "" {
		petugas.Username = username
	}

	if email != "" && email != petugas.Email {

		if _, err := mail.ParseAddress(email); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "format email tidak valid",
			})
			return
		}

		var existing models.Petugas

		if err := config.DB.
			Where("email = ? AND id <> ?", email, petugas.ID).
			First(&existing).Error; err == nil {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": "email sudah digunakan oleh akun lain",
			})
			return
		}

		petugas.Email = email
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

		petugas.Password = string(hashedPassword)
	}

	fileHeader, err := c.FormFile("foto")
	if err == nil {

		oldFoto = petugas.Foto

		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal membaca file foto",
			})
			return
		}
		defer file.Close()

		fotoURL, err := utils.UploadImage(
			file,
			"wisata_profiles/petugas",
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "gagal upload foto",
			})
			return
		}

		petugas.Foto = fotoURL
	}

	if err := config.DB.Save(&petugas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal mengupdate data petugas",
		})
		return
	}

	if oldFoto != "" {
		_ = utils.DeleteImageByURL(oldFoto)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data petugas berhasil diupdate",
		"data": gin.H{
			"id":       petugas.ID,
			"username": petugas.Username,
			"email":    petugas.Email,
			"foto":     petugas.Foto,
		},
	})
}

func DeletePetugas(c *gin.Context) {
	id := c.Param("id")

	petugasID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var petugas models.Petugas

	if err := config.DB.First(&petugas, "id = ?", petugasID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "data petugas tidak ditemukan",
		})
		return
	}

	if petugas.Foto != "" {
		_ = utils.DeleteImageByURL(petugas.Foto)
	}

	if err := config.DB.Delete(&petugas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "gagal menghapus data petugas",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data petugas berhasil dihapus",
	})
}

func GetPetugasByID(c *gin.Context) {
	id := c.Param("id")

	petugasID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id tidak valid",
		})
		return
	}

	var petugas models.Petugas

	if err := config.DB.
		Select("id, username, email, foto, created_at").
		First(&petugas, "id = ?", petugasID).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "petugas tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "data admin berhasil diambil",
		"data":    petugas,
	})
}
