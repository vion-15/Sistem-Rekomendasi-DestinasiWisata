package seeders

import (
	"fmt"
	"log"
	"os"

	"backend-wisata/config"
	"backend-wisata/models"

	"golang.org/x/crypto/bcrypt"
)

func SeedAdmin() error {
	var admin models.Admin

	result := config.DB.
		Where("email = ?", "admin@wisata.com").
		First(&admin)

	if result.RowsAffected == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(os.Getenv("DEFAULT_ADMIN_PASSWORD")),
			bcrypt.DefaultCost,
		)

		if err != nil {
			return err
		}

		admin := models.Admin{
			Username: "admin_super",
			Email:    "admin@wisata.com",
			Password: string(hashedPassword),
		}

		if err := config.DB.Create(&admin).Error; err != nil {
			return err
		}

		log.Println("Seeder admin berhasil")
		fmt.Println("Seeder: Akun Admin default (admin@wisata.com) berhasil dibuat!")
	} else {
		fmt.Println("Seeder: Akun Admin sudah tersedia, skip seeder.")
	}

	return nil
}
