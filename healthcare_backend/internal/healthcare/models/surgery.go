package models

import "gorm.io/gorm"

// Surgery represents a scheduled surgical procedure.
// Status: Scheduled | In-Progress | Completed | Cancelled
type Surgery struct {
	gorm.Model
	PatientID     uint   `gorm:"column:patient_id;not null" json:"patient_id"`
	AdmissionID   *uint  `gorm:"column:admission_id" json:"admission_id"`
	SurgeonID     uint   `gorm:"column:surgeon_id;not null" json:"surgeon_id"` // Doctor ID
	SurgeryName   string `gorm:"column:surgery_name;not null" json:"surgery_name"`
	ScheduledTime string `gorm:"column:scheduled_time;not null" json:"scheduled_time"`
	OTRoom        string `gorm:"column:ot_room" json:"ot_room"` // Operating Theatre
	Status        string `gorm:"column:status;default:'Scheduled'" json:"status"`
	Notes         string `gorm:"column:notes;type:text" json:"notes"`
	Duration      int    `gorm:"column:duration" json:"duration"` // estimated minutes

	// Relationships
	Patient   Patient    `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Surgeon   Doctor     `gorm:"foreignKey:SurgeonID" json:"surgeon,omitempty"`
	Admission *Admission `gorm:"foreignKey:AdmissionID" json:"admission,omitempty"`
}

func (Surgery) TableName() string {
	return "hc_surgeries"
}
