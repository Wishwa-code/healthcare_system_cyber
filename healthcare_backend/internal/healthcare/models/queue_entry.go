package models

import "gorm.io/gorm"

// QueueEntry manages the real-time patient flow for an appointment slot.
type QueueEntry struct {
	gorm.Model
	AppointmentID uint   `gorm:"column:appointment_id;not null" json:"appointment_id"`
	QueueNumber   int    `gorm:"column:queue_number" json:"queue_number"`
	Status        string `gorm:"column:status;default:'Waiting'" json:"status"` // Waiting | Called | Completed | Skipped
	CalledAt      string `gorm:"column:called_at" json:"called_at"`

	// Relationship
	Appointment Appointment `gorm:"foreignKey:AppointmentID" json:"appointment,omitempty"`
}

func (QueueEntry) TableName() string {
	return "hc_queue_entries"
}
