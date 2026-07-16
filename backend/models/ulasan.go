package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Ulasan struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`

	// Relasi ke Destinasi
	DestinasiID uuid.UUID `gorm:"type:uuid;not null" json:"id_destinasi"`
	Destinasi   Destinasi `gorm:"foreignKey:DestinasiID" json:"destinasi"`

	// Relasi ke Wisatawan
	WisatawanID uuid.UUID `gorm:"type:uuid;not null" json:"id_wisatawan"`
	Wisatawan   Wisatawan `gorm:"foreignKey:WisatawanID" json:"wisatawan"`

	Rating   int    `gorm:"type:int;not null" json:"rating"` // Misal 1-5
	Komentar string `gorm:"type:text;not null" json:"komentar"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *Ulasan) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return nil
}
