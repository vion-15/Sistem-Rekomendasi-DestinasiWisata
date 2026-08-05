package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Pencarian struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`

	// Relasi ke tabel Wisatawan
	WisatawanID uuid.UUID `gorm:"type:uuid;not null" json:"id_wisatawan"`
	Wisatawan   Wisatawan `gorm:"foreignKey:WisatawanID" json:"wisatawan"`

	Keyword string `gorm:"type:text;not null" json:"keyword"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (r *Pencarian) BeforeCreate(tx *gorm.DB) (err error) {
	r.ID = uuid.New()
	return nil
}
