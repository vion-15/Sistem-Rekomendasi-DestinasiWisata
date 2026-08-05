package controllers

import (
	"net/http"
	"time"

	"backend-wisata/config"
	"backend-wisata/models"

	"github.com/gin-gonic/gin"
)

type GrafikData struct {
	Hari      string `json:"hari"`
	Pencarian int64  `json:"pencarian"`
}

type GrafikDestinasi struct {
	Hari      string `json:"hari"`
	Interaksi int64  `json:"interaksi"`
}

type MonitoringResponse struct {
	TotalPencarian   int64        `json:"total_pencarian"`
	PencarianHariIni int64        `json:"pencarian_hari_ini"`
	RataRataHari     int64        `json:"rata_rata_hari"`
	PuncakPencarian  string       `json:"puncak_pencarian"`
	Grafik           []GrafikData `json:"grafik"`
}

type MonitoringDestinasiResponse struct {
	TotalDestinasi    int64             `json:"total_destinasi"`
	DestinasiBaru     int64             `json:"destinasi_baru"`
	InteraksiPengguna int64             `json:"interaksi_pengguna"`
	Grafik            []GrafikDestinasi `json:"grafik"`
}

func GetStatistikPencarian(c *gin.Context) {
	var total int64
	var hariIni int64
	var response MonitoringResponse

	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	config.DB.Model(&models.Pencarian{}).Count(&total)
	response.TotalPencarian = total

	config.DB.Model(&models.Pencarian{}).Where("created_at >= ?", startOfDay).Count(&hariIni)
	response.PencarianHariIni = hariIni

	var total30Hari int64
	start30Days := startOfDay.AddDate(0, 0, -30)
	config.DB.Model(&models.Pencarian{}).Where("created_at >= ?", start30Days).Count(&total30Hari)
	response.RataRataHari = total30Hari / 30

	namaHariIndo := map[time.Weekday]string{
		time.Sunday:    "Minggu",
		time.Monday:    "Senin",
		time.Tuesday:   "Selasa",
		time.Wednesday: "Rabu",
		time.Thursday:  "Kamis",
		time.Friday:    "Jumat",
		time.Saturday:  "Sabtu",
	}

	var grafik []GrafikData
	var maxPencarian int64 = -1
	puncakHari := "-"

	for i := 6; i >= 0; i-- {
		targetDate := startOfDay.AddDate(0, 0, -i)
		nextDate := targetDate.AddDate(0, 0, 1)

		var count int64
		config.DB.Model(&models.Pencarian{}).
			Where("created_at >= ? AND created_at < ?", targetDate, nextDate).
			Count(&count)

		hariStr := namaHariIndo[targetDate.Weekday()]
		grafik = append(grafik, GrafikData{
			Hari:      hariStr,
			Pencarian: count,
		})

		if count > maxPencarian {
			maxPencarian = count
			puncakHari = hariStr
		}
	}

	response.Grafik = grafik
	if total == 0 {
		response.PuncakPencarian = "-"
	} else {
		response.PuncakPencarian = puncakHari
	}

	c.JSON(http.StatusOK, response)
}

func GetStatistikDestinasi(c *gin.Context) {
	var response MonitoringDestinasiResponse
	var totalDestinasi int64
	var destinasiBaru int64
	var interaksiPengguna int64

	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	// 1. Hitung Total Destinasi di Database
	// Asumsi Anda memiliki model bernama Destinasi
	config.DB.Model(&models.Destinasi{}).Count(&totalDestinasi)
	response.TotalDestinasi = totalDestinasi

	// 2. Hitung Destinasi Baru (yang ditambahkan hari ini)
	config.DB.Model(&models.Destinasi{}).Where("created_at >= ?", startOfDay).Count(&destinasiBaru)
	response.DestinasiBaru = destinasiBaru

	// 3. Hitung Total Interaksi Pengguna
	// Asumsi Anda memiliki model RiwayatDestinasi tempat riwayat klik disimpan
	config.DB.Model(&models.LokasiDestinasi{}).Count(&interaksiPengguna)
	response.InteraksiPengguna = interaksiPengguna

	// 4. Susun Data Grafik 7 Hari Terakhir dari interaksi RiwayatDestinasi
	namaHariIndo := map[time.Weekday]string{
		time.Sunday:    "Minggu",
		time.Monday:    "Senin",
		time.Tuesday:   "Selasa",
		time.Wednesday: "Rabu",
		time.Thursday:  "Kamis",
		time.Friday:    "Jumat",
		time.Saturday:  "Sabtu",
	}

	var grafik []GrafikDestinasi

	// Loop mundur H-6 sampai H-0 (Hari ini)
	for i := 6; i >= 0; i-- {
		targetDate := startOfDay.AddDate(0, 0, -i)
		nextDate := targetDate.AddDate(0, 0, 1)

		var count int64
		config.DB.Model(&models.LokasiDestinasi{}).
			Where("created_at >= ? AND created_at < ?", targetDate, nextDate).
			Count(&count)

		grafik = append(grafik, GrafikDestinasi{
			Hari:      namaHariIndo[targetDate.Weekday()],
			Interaksi: count,
		})
	}

	response.Grafik = grafik

	c.JSON(http.StatusOK, response)
}
