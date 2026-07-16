package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Laporan struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	JenisLaporan string    `gorm:"type:varchar(100);not null" json:"jenis_laporan"`
	Periode      string    `gorm:"type:varchar(50);not null" json:"periode"`

	AdminID uuid.UUID `gorm:"type:uuid;not null" json:"id_admin"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (l *Laporan) BeforeCreate(tx *gorm.DB) (err error) {
	l.ID = uuid.New()
	return nil
}
