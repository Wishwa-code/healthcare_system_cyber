package models

import "gorm.io/gorm"

// Appointment represents a scheduled patient-doctor meeting.
// Status: Pending | Confirmed | Cancelled | Completed
type Appointment struct {
	gorm.Model
	PatientID     uint   `gorm:"column:patient_id;not null" json:"patient_id"`
	DoctorID      uint   `gorm:"column:doctor_id;not null" json:"doctor_id"`
	ScheduledTime string `gorm:"column:scheduled_time;not null" json:"scheduled_time"`
	Status        string `gorm:"column:status;default:'Pending'" json:"status"`
	Notes         string `gorm:"column:notes;type:text" json:"notes"`

	// Relationships
	Patient      Patient      `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor       Doctor       `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	QueueEntries []QueueEntry `gorm:"foreignKey:AppointmentID" json:"queue_entries,omitempty"`
}

func (Appointment) TableName() string {
	return "hc_appointments"
}
