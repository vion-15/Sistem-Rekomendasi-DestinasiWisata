package helpers

import (
	"strings"

	"backend-wisata/models"
)

func ApplyLanguage(dest *models.Destinasi, lang string) {

	if strings.ToLower(lang) != "en" {
		return
	}

	if dest.NamaEn != "" {
		dest.Nama = dest.NamaEn
	}

	if dest.DeskripsiEn != "" {
		dest.Deskripsi = dest.DeskripsiEn
	}

	if dest.AktivitasEn != "" {
		dest.Aktivitas = dest.AktivitasEn
	}

	if dest.KotaEn != "" {
		dest.Kota = dest.KotaEn
	}

	if dest.KategoriEn != "" {
		dest.Kategori = dest.KategoriEn
	}
}

func ApplyLanguageList(destinations []models.Destinasi, lang string) {

	for i := range destinations {
		ApplyLanguage(&destinations[i], lang)
	}

}
