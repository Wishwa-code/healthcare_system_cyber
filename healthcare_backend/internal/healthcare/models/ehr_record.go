package models

import "gorm.io/gorm"

// EHRRecord holds the Electronic Health Record for a patient.
type EHRRecord struct {
	gorm.Model
	PatientID      uint   `gorm:"column:patient_id;not null" json:"patient_id"`
	Allergies      string `gorm:"column:allergies;type:text" json:"allergies"`
	MedicalHistory string `gorm:"column:medical_history;type:text" json:"medical_history"`
	Immunizations  string `gorm:"column:immunizations;type:text" json:"immunizations"`

	// Relationship
	Patient Patient `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
}

func (EHRRecord) TableName() string {
	return "hc_ehr_records"
}
