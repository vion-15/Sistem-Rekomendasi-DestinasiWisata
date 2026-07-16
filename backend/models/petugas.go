package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Petugas struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Username  string         `gorm:"type:varchar(100);not null" json:"username"`
	Email     string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"type:varchar(255);not null" json:"-"`
	Foto      string         `gorm:"type:varchar(255)" json:"foto"` // Menyimpan path atau URL gambar
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Hook GORM untuk otomatis generate UUID sebelum data disimpan ke database
func (p *Petugas) BeforeCreate(tx *gorm.DB) (err error) {
	p.ID = uuid.New()
	return nil
}
