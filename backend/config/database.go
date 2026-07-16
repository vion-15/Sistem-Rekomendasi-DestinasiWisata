package config

import (
	"fmt"
	"log"
	"os"

	"backend-wisata/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")
	sslmode := os.Getenv("DB_SSLMODE")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
		host, user, password, dbname, port, sslmode)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke database:", err)
	}

	fmt.Println("Koneksi database berhasil!")

	// GORM akan otomatis membuat tabel 'admins'
	err = database.AutoMigrate(&models.Admin{}, &models.Petugas{}, &models.Destinasi{}, &models.Wisatawan{}, &models.Ulasan{}, &models.RiwayatPencarian{}, &models.RiwayatDestinasi{}, &models.Laporan{}, &models.HasilRekomendasi{})
	if err != nil {
		log.Fatal("Gagal melakukan migrasi database:", err)
	}

	fmt.Println("Migrasi tabel Admin, Petugas, Destinasi dan Wisatawan berhasil!")
	DB = database
}
