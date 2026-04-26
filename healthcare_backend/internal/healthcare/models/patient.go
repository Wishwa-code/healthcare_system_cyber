package models

import "gorm.io/gorm"

// Patient represents a hospital patient record.
type Patient struct {
	gorm.Model
	FullName    string `gorm:"column:full_name;not null" json:"full_name"`
	BloodGroup  string `gorm:"column:blood_group" json:"blood_group"`
	DOB         string `gorm:"column:dob" json:"dob"`
	Gender      string `gorm:"column:gender" json:"gender"`
	ContactInfo string `gorm:"column:contact_info" json:"contact_info"`

	// Relationships
	EHRRecord    *EHRRecord    `gorm:"foreignKey:PatientID" json:"ehr_record,omitempty"`
	Appointments []Appointment `gorm:"foreignKey:PatientID" json:"appointments,omitempty"`
	Admissions   []Admission   `gorm:"foreignKey:PatientID" json:"admissions,omitempty"`
}

func (Patient) TableName() string {
	return "hc_patients"
}
