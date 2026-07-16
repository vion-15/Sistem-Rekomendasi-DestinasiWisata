package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RiwayatDestinasi struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`

	// Relasi ke tabel Wisatawan
	WisatawanID uuid.UUID `gorm:"type:uuid;not null" json:"id_wisatawan"`
	Wisatawan   Wisatawan `gorm:"foreignKey:WisatawanID" json:"wisatawan"`

	// Relasi ke tabel Destinasi
	DestinasiID uuid.UUID `gorm:"type:uuid;not null" json:"id_destinasi"`
	Destinasi   Destinasi `gorm:"foreignKey:DestinasiID" json:"destinasi"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (r *RiwayatDestinasi) BeforeCreate(tx *gorm.DB) (err error) {
	r.ID = uuid.New()
	return nil
}
