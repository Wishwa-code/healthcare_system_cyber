package models

import "gorm.io/gorm"

// OPDConsultation is created from a Completed appointment (Outpatient).
type OPDConsultation struct {
	gorm.Model
	AppointmentID uint   `gorm:"column:appointment_id;not null;uniqueIndex" json:"appointment_id"`
	ChiefComplaint string `gorm:"column:chief_complaint;type:text" json:"chief_complaint"`
	Diagnosis      string `gorm:"column:diagnosis;type:text" json:"diagnosis"`
	VitalSigns     string `gorm:"column:vital_signs;type:text" json:"vital_signs"` // JSON blob
	FollowUpDate   string `gorm:"column:follow_up_date" json:"follow_up_date"`

	// Relationships
	Appointment  Appointment  `gorm:"foreignKey:AppointmentID" json:"appointment,omitempty"`
	Prescriptions []Prescription `gorm:"foreignKey:ConsultationID" json:"prescriptions,omitempty"`
}

func (OPDConsultation) TableName() string {
	return "hc_opd_consultations"
}
