package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Destinasi struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Nama           string    `gorm:"type:varchar(255);not null" json:"nama"`
	Deskripsi      string    `gorm:"type:text;not null" json:"deskripsi"`
	DeskripsiClean string    `json:"deskripsi_clean" gorm:"type:text"`
	Aktivitas      string    `gorm:"type:text" json:"aktivitas"`
	AktivitasClean string    `gorm:"type:text" json:"aktivitas_clean"`
	Alamat         string    `gorm:"type:text;not null" json:"alamat"`
	Latitude       float64   `gorm:"type:decimal(10,8);not null" json:"latitude"`
	Longitude      float64   `gorm:"type:decimal(11,8);not null" json:"longitude"`
	Gambar         string    `gorm:"type:varchar(255)" json:"gambar"`
	Kota           string    `gorm:"type:varchar(100);not null" json:"kota"`
	Kategori       string    `gorm:"type:varchar(100);not null" json:"kategori"`

	// Relasi Foreign Key ke tabel Petugas
	PetugasID *uuid.UUID `gorm:"type:uuid" json:"id_petugas"`
	Petugas   Petugas    `gorm:"foreignKey:PetugasID" json:"petugas"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Hook GORM untuk otomatis generate UUID sebelum data disimpan ke database
func (d *Destinasi) BeforeCreate(tx *gorm.DB) (err error) {
	d.ID = uuid.New()
	return nil
}
