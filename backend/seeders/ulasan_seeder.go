package seeders

import (
	"fmt"
	"log"

	"backend-wisata/config"
	"backend-wisata/models"
)

func SeedUlasan() error {
	var count int64
	config.DB.Model(&models.Ulasan{}).Count(&count)

	if count == 0 {
		var destinasi models.Destinasi
		var wisatawan models.Wisatawan

		// Ambil satu destinasi dan satu wisatawan acak dari database
		if err := config.DB.First(&destinasi).Error; err != nil {
			fmt.Println("Seeder Ulasan di-skip: Belum ada data Destinasi")
			return nil
		}
		if err := config.DB.First(&wisatawan).Error; err != nil {
			fmt.Println("Seeder Ulasan di-skip: Belum ada data Wisatawan")
			return nil
		}

		dummyUlasan := []models.Ulasan{
			{
				DestinasiID: destinasi.ID,
				WisatawanID: wisatawan.ID,
				Rating:      5,
				Komentar:    "Tempatnya sangat bersih dan pemandangannya indah luar biasa! Sangat direkomendasikan untuk liburan keluarga. Fasilitas umumnya juga sangat terawat dengan baik.",
			},
			{
				DestinasiID: destinasi.ID,
				WisatawanID: wisatawan.ID,
				Rating:      3,
				Komentar:    "Tempatnya lumayan bagus, tapi akses jalannya cukup sulit dan harga tiket masuknya terlalu mahal untuk fasilitas yang didapatkan.",
			},
		}

		if err := config.DB.Create(&dummyUlasan).Error; err != nil {
			return err
		}

		log.Println("Seeder ulasan berhasil")
		fmt.Println("Seeder: Data dummy Ulasan berhasil dibuat!")
	} else {
		fmt.Println("Seeder: Data Ulasan sudah tersedia, skip seeder.")
	}

	return nil
}
