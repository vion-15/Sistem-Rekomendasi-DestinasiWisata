package controllers

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"backend-wisata/config" // Sesuaikan dengan path project Anda
	"backend-wisata/models" // Sesuaikan dengan path project Anda
)

type LaporanInput struct {
	AdminID string `json:"id_admin"`
	Periode string `json:"periode"` // Menangkap periode dari input Next.js (contoh: "2026-07")
}

func BuatLaporanPencarian(c *gin.Context) {
	var input LaporanInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid, pastikan id_admin dan periode terisi"})
		return
	}

	adminUUID, err := uuid.Parse(input.AdminID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format id_admin tidak valid"})
		return
	}

	// Konversi format "2026-07" menjadi "Juli 2026"
	parsedTime, err := time.Parse("2006-01", input.Periode)
	var periodeStr string
	if err == nil {
		bulanIndo := map[time.Month]string{
			1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
			5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
			9: "September", 10: "Oktober", 11: "November", 12: "Desember",
		}
		periodeStr = fmt.Sprintf("%s %d", bulanIndo[parsedTime.Month()], parsedTime.Year())
	} else {
		// Fallback jika format yang dikirim frontend bukan "YYYY-MM"
		periodeStr = input.Periode
	}

	// Validasi agar tidak membuat laporan duplikat di periode yang sama
	var count int64
	config.DB.Model(&models.Laporan{}).
		Where("jenis_laporan = ? AND periode = ?", "Data Pencarian", periodeStr).
		Count(&count)

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Laporan untuk periode " + periodeStr + " sudah pernah dikirim ke Menu Laporan"})
		return
	}

	// Simpan ke database
	laporanBaru := models.Laporan{
		JenisLaporan: "Data Pencarian",
		Periode:      periodeStr,
		AdminID:      adminUUID,
	}

	if err := config.DB.Create(&laporanBaru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan laporan ke database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Laporan " + periodeStr + " berhasil dikirim ke Menu Laporan",
		"data":    laporanBaru,
	})
}

// Mengambil semua daftar laporan
func GetDaftarLaporan(c *gin.Context) {
	var laporanList []models.Laporan

	// Mengambil data dan diurutkan dari yang paling baru (created_at DESC)
	if err := config.DB.Order("created_at desc").Find(&laporanList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data laporan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": laporanList,
	})
}

// Menghapus laporan berdasarkan ID
func DeleteLaporan(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Where("id = ?", id).Delete(&models.Laporan{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus laporan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Laporan berhasil dihapus"})
}

// Men-generate dan mengunduh file CSV
func DownloadLaporan(c *gin.Context) {
	id := c.Param("id")

	// 1. Cari data laporan untuk memastikan periode dan jenisnya
	var laporan models.Laporan
	if err := config.DB.Where("id = ?", id).First(&laporan).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Laporan tidak ditemukan"})
		return
	}

	// Saat ini hanya mendukung Data Pencarian
	if laporan.JenisLaporan != "Data Pencarian" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jenis laporan ini belum memiliki format unduhan"})
		return
	}

	// 2. Parse string "Juli 2026" untuk mendapatkan rentang waktu pencarian
	parts := strings.Split(laporan.Periode, " ")
	if len(parts) != 2 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Format periode laporan rusak di database"})
		return
	}

	bulanStr := parts[0]
	tahunStr := parts[1]
	tahun, _ := strconv.Atoi(tahunStr)

	bulanMap := map[string]time.Month{
		"Januari": 1, "Februari": 2, "Maret": 3, "April": 4,
		"Mei": 5, "Juni": 6, "Juli": 7, "Agustus": 8,
		"September": 9, "Oktober": 10, "November": 11, "Desember": 12,
	}
	bulan := bulanMap[bulanStr]

	// Tentukan tanggal awal bulan dan awal bulan depannya
	startDate := time.Date(tahun, bulan, 1, 0, 0, 0, 0, time.Local)
	endDate := startDate.AddDate(0, 1, 0)

	// 3. Ambil data dari tabel RiwayatPencarian
	var riwayat []models.RiwayatPencarian
	if err := config.DB.Where("created_at >= ? AND created_at < ?", startDate, endDate).Find(&riwayat).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data riwayat pencarian"})
		return
	}

	// 4. Siapkan File CSV untuk diunduh
	namaFile := fmt.Sprintf("Data_Pencarian_%s.csv", strings.ReplaceAll(laporan.Periode, " ", "_"))

	// Set header HTTP agar browser menganggapnya sebagai unduhan file
	c.Writer.Header().Set("Content-Type", "text/csv")
	c.Writer.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", namaFile))

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Tulis Header Kolom CSV
	writer.Write([]string{"No", "Waktu Pencarian", "ID Wisatawan", "Kata Kunci (Keyword)"})

	// Tulis Baris Data
	for i, r := range riwayat {
		writer.Write([]string{
			strconv.Itoa(i + 1),
			r.CreatedAt.Format("02-01-2006 15:04:05"), // Format: DD-MM-YYYY HH:MM:SS
			r.WisatawanID.String(),
			r.Keyword,
		})
	}
}

func BuatLaporanDestinasi(c *gin.Context) {
	var input LaporanInput // Menggunakan struct LaporanInput yang sudah ada sebelumnya

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid, pastikan id_admin dan periode terisi"})
		return
	}

	adminUUID, err := uuid.Parse(input.AdminID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format id_admin tidak valid"})
		return
	}

	// Konversi format "2026-07" menjadi "Juli 2026"
	parsedTime, err := time.Parse("2006-01", input.Periode)
	var periodeStr string
	if err == nil {
		bulanIndo := map[time.Month]string{
			1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
			5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
			9: "September", 10: "Oktober", 11: "November", 12: "Desember",
		}
		periodeStr = fmt.Sprintf("%s %d", bulanIndo[parsedTime.Month()], parsedTime.Year())
	} else {
		periodeStr = input.Periode
	}

	// Validasi duplikat
	var count int64
	config.DB.Model(&models.Laporan{}).
		Where("jenis_laporan = ? AND periode = ?", "Data Lokasi Destinasi", periodeStr).
		Count(&count)

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Laporan Lokasi Destinasi untuk periode " + periodeStr + " sudah ada"})
		return
	}

	// Simpan Laporan
	laporanBaru := models.Laporan{
		JenisLaporan: "Data Lokasi Destinasi", // NAMA JENIS LAPORAN HARUS SESUAI DESAIN UI
		Periode:      periodeStr,
		AdminID:      adminUUID,
	}

	if err := config.DB.Create(&laporanBaru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan laporan ke database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Laporan " + periodeStr + " berhasil dikirim ke Menu Laporan",
		"data":    laporanBaru,
	})
}

// Fungsi untuk mengirim data laporan ulasan
func BuatLaporanUlasan(c *gin.Context) {
	var input LaporanInput // Menggunakan struct LaporanInput yang sama

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid, pastikan id_admin dan periode terisi"})
		return
	}

	adminUUID, err := uuid.Parse(input.AdminID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format id_admin tidak valid"})
		return
	}

	// Konversi format "2026-07" menjadi "Juli 2026"
	parsedTime, err := time.Parse("2006-01", input.Periode)
	var periodeStr string
	if err == nil {
		bulanIndo := map[time.Month]string{
			1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
			5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
			9: "September", 10: "Oktober", 11: "November", 12: "Desember",
		}
		periodeStr = fmt.Sprintf("%s %d", bulanIndo[parsedTime.Month()], parsedTime.Year())
	} else {
		periodeStr = input.Periode
	}

	// Cek apakah laporan untuk periode tersebut sudah pernah dikirim
	var count int64
	config.DB.Model(&models.Laporan{}).
		Where("jenis_laporan = ? AND periode = ?", "Data Ulasan dan Rating", periodeStr).
		Count(&count)

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Laporan Ulasan untuk periode " + periodeStr + " sudah ada di Menu Laporan"})
		return
	}

	// Buat record baru di tabel Laporan
	laporanBaru := models.Laporan{
		JenisLaporan: "Data Ulasan dan Rating", // Harus spesifik
		Periode:      periodeStr,
		AdminID:      adminUUID,
	}

	if err := config.DB.Create(&laporanBaru).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan laporan ke database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Laporan " + periodeStr + " berhasil dikirim ke Menu Laporan",
		"data":    laporanBaru,
	})
}
