package models

import "gorm.io/gorm"

// Doctor represents a medical professional.
type Doctor struct {
	gorm.Model
	Name           string `gorm:"column:name;not null" json:"name"`
	Specialization string `gorm:"column:specialization" json:"specialization"`
	LicenseNo      string `gorm:"column:license_no;uniqueIndex" json:"license_no"`

	// Relationships
	Appointments  []Appointment       `gorm:"foreignKey:DoctorID" json:"appointments,omitempty"`
	Availabilities []DoctorAvailability `gorm:"foreignKey:DoctorID" json:"availabilities,omitempty"`
}

func (Doctor) TableName() string {
	return "hc_doctors"
}
