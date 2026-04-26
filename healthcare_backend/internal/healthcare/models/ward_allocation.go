package models

import "gorm.io/gorm"

// WardAllocation maps an admitted patient to a specific ward/bed.
type WardAllocation struct {
	gorm.Model
	AdmissionID uint   `gorm:"column:admission_id;not null" json:"admission_id"`
	WardName    string `gorm:"column:ward_name;not null" json:"ward_name"`
	BedNumber   string `gorm:"column:bed_number" json:"bed_number"`
	AllocatedAt string `gorm:"column:allocated_at" json:"allocated_at"`
	ReleasedAt  string `gorm:"column:released_at" json:"released_at"`

	// Relationship
	Admission Admission `gorm:"foreignKey:AdmissionID" json:"admission,omitempty"`
}

func (WardAllocation) TableName() string {
	return "hc_ward_allocations"
}
