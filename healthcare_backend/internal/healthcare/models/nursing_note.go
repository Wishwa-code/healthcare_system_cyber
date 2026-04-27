package models

import "gorm.io/gorm"

// NursingNote is a shift note recorded by a nurse for a patient.
type NursingNote struct {
	gorm.Model
	PatientID   uint   `gorm:"column:patient_id;not null" json:"patient_id"`
	AdmissionID *uint  `gorm:"column:admission_id" json:"admission_id"`
	WardName    string `gorm:"column:ward_name" json:"ward_name"`
	NurseID     uint   `gorm:"column:nurse_id" json:"nurse_id"` // User ID of nurse
	Shift       string `gorm:"column:shift" json:"shift"`       // Morning | Afternoon | Night
	Note        string `gorm:"column:note;type:text;not null" json:"note"`
	RecordedAt  string `gorm:"column:recorded_at" json:"recorded_at"`

	// Relationships
	Patient   Patient    `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Admission *Admission `gorm:"foreignKey:AdmissionID" json:"admission,omitempty"`
}

func (NursingNote) TableName() string {
	return "hc_nursing_notes"
}
