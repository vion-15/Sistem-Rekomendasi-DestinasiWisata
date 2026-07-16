package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HasilRekomendasi struct {
	// Tag default dihapus karena kita akan set manual via Golang
	ID              uuid.UUID `gorm:"type:uuid;primaryKey"`
	WisatawanID     uuid.UUID `gorm:"type:uuid;not null"`
	DestinasiID     uuid.UUID `gorm:"type:uuid;not null"`
	SimilarityScore float64   `gorm:"type:float"`
	CreatedAt       time.Time

	// Relasi
	Wisatawan Wisatawan `gorm:"foreignKey:WisatawanID"`
	Destinasi Destinasi `gorm:"foreignKey:DestinasiID"`
}

// Hook BeforeCreate untuk generate UUID otomatis sebelum disimpan ke DB
func (h *HasilRekomendasi) BeforeCreate(tx *gorm.DB) (err error) {
	h.ID = uuid.New()
	return nil
}
