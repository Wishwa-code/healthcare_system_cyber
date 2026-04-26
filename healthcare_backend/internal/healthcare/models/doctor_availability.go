package models

import "gorm.io/gorm"

// DoctorAvailability represents a doctor's shift/availability slot.
type DoctorAvailability struct {
	gorm.Model
	DoctorID  uint   `gorm:"column:doctor_id;not null" json:"doctor_id"`
	DayOfWeek string `gorm:"column:day_of_week" json:"day_of_week"` // e.g., "Monday"
	StartTime string `gorm:"column:start_time" json:"start_time"`   // e.g., "08:00"
	EndTime   string `gorm:"column:end_time" json:"end_time"`       // e.g., "16:00"
	Location  string `gorm:"column:location" json:"location"`

	// Relationship
	Doctor Doctor `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
}

func (DoctorAvailability) TableName() string {
	return "hc_doctor_availabilities"
}
