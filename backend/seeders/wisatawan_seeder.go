package seeders

import (
	"fmt"
	"log"

	"backend-wisata/config"
	"backend-wisata/models"

	"golang.org/x/crypto/bcrypt"
)

func SeedWisatawan() error {
	var count int64
	// Cek apakah tabel wisatawan sudah ada isinya
	config.DB.Model(&models.Wisatawan{}).Count(&count)

	if count == 0 {
		// Buat password default untuk dummy
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("wisatawan123"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		// Siapkan beberapa data dummy
		dummyWisatawan := []models.Wisatawan{
			{
				Username: "Budi Santoso",
				Email:    "budi@gmail.com",
				Password: string(hashedPassword),
				Foto:     "https://ui-avatars.com/api/?name=Budi+Santoso&background=0D8ABC&color=fff",
			},
			{
				Username: "Siti Rahma",
				Email:    "siti.rahma@yahoo.com",
				Password: string(hashedPassword),
				Foto:     "https://ui-avatars.com/api/?name=Siti+Rahma&background=F59E0B&color=fff",
			},
			{
				Username: "Andi Wijaya",
				Email:    "andi.w@outlook.com",
				Password: string(hashedPassword),
				Foto:     "https://ui-avatars.com/api/?name=Andi+Wijaya&background=10B981&color=fff",
			},
		}

		// Insert semua data dummy ke database
		if err := config.DB.Create(&dummyWisatawan).Error; err != nil {
			return err
		}

		log.Println("Seeder wisatawan berhasil")
		fmt.Println("Seeder: Data dummy Wisatawan berhasil dibuat!")
	} else {
		fmt.Println("Seeder: Data Wisatawan sudah tersedia, skip seeder.")
	}

	return nil
}
