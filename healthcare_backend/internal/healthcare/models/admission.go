package models

import "gorm.io/gorm"

// Admission tracks an inpatient stay.
type Admission struct {
	gorm.Model
	PatientID       uint   `gorm:"column:patient_id;not null" json:"patient_id"`
	AdmissionDate   string `gorm:"column:admission_date;not null" json:"admission_date"`
	DischargeDate   string `gorm:"column:discharge_date" json:"discharge_date"`
	DischargeSummary string `gorm:"column:discharge_summary;type:text" json:"discharge_summary"`
	AdmittingDoctorID *uint `gorm:"column:admitting_doctor_id" json:"admitting_doctor_id"`

	// Relationships
	Patient         Patient          `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	WardAllocations []WardAllocation `gorm:"foreignKey:AdmissionID" json:"ward_allocations,omitempty"`
	Prescriptions   []Prescription   `gorm:"foreignKey:AdmissionID" json:"prescriptions,omitempty"`
}

func (Admission) TableName() string {
	return "hc_admissions"
}
