package main

import (
	"fmt"
	"log"
	"os"

	"backend-wisata/config"
	"backend-wisata/routes"
	"backend-wisata/seeders"
	"backend-wisata/utils"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Load variabel dari file .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: File .env tidak ditemukan, menggunakan environment variable sistem")
	}

	if err := utils.InitCloudinary(); err != nil {
		log.Fatalf("Gagal inisialisasi Cloudinary: %v", err)
	}
	fmt.Println("Cloudinary berhasil diinisialisasi!")

	// 2. Konek ke Database & Auto-Migrate
	config.ConnectDatabase()

	// 3. Jalankan Seeder Admin
	if err := seeders.SeedAdmin(); err != nil {
		log.Fatalf("Gagal menjalankan seeder admin: %v", err)
	}

	// [BARU] Jalankan Seeder Wisatawan
	if err := seeders.SeedWisatawan(); err != nil {
		log.Fatalf("Gagal menjalankan seeder wisatawan: %v", err)
	}

	if err := seeders.SeedUlasan(); err != nil {
		log.Fatalf("Gagal menjalankan seeder ulasan: %v", err)
	}

	// 4. Setup Router Gin
	r := routes.SetupRouter()

	// 5. Jalankan Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server berjalan di Port:%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
