package models

import "gorm.io/gorm"

// Bed represents a hospital bed in a ward.
// Status: Available | Occupied | Maintenance | Reserved
type Bed struct {
	gorm.Model
	WardName   string `gorm:"column:ward_name;not null" json:"ward_name"`
	BedNumber  string `gorm:"column:bed_number;not null;uniqueIndex" json:"bed_number"`
	BedType    string `gorm:"column:bed_type" json:"bed_type"` // General | ICU | Maternity | Pediatric
	Status     string `gorm:"column:status;default:'Available'" json:"status"`
	Floor      string `gorm:"column:floor" json:"floor"`
	AdmissionID *uint `gorm:"column:admission_id" json:"admission_id"` // set when occupied

	// Relationship
	Admission *Admission `gorm:"foreignKey:AdmissionID" json:"admission,omitempty"`
}

func (Bed) TableName() string {
	return "hc_beds"
}
