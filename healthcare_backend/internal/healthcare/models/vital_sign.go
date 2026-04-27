package models

import "gorm.io/gorm"

// VitalSign records patient vitals during OPD or IPD visits.
type VitalSign struct {
	gorm.Model
	PatientID     uint    `gorm:"column:patient_id;not null" json:"patient_id"`
	RecordedByID  uint    `gorm:"column:recorded_by_id" json:"recorded_by_id"` // Doctor/Nurse user ID
	Temperature   float64 `gorm:"column:temperature;type:decimal(5,2)" json:"temperature"`
	BloodPressure string  `gorm:"column:blood_pressure" json:"blood_pressure"` // e.g. "120/80"
	Pulse         int     `gorm:"column:pulse" json:"pulse"`                   // bpm
	RespiratoryRate int   `gorm:"column:respiratory_rate" json:"respiratory_rate"` // per min
	OxygenSaturation float64 `gorm:"column:oxygen_saturation;type:decimal(5,2)" json:"oxygen_saturation"` // SpO2 %
	Weight        float64 `gorm:"column:weight;type:decimal(6,2)" json:"weight"` // kg
	Height        float64 `gorm:"column:height;type:decimal(6,2)" json:"height"` // cm
	Notes         string  `gorm:"column:notes;type:text" json:"notes"`
	RecordedAt    string  `gorm:"column:recorded_at" json:"recorded_at"`

	// Relationship
	Patient Patient `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
}

func (VitalSign) TableName() string {
	return "hc_vital_signs"
}
