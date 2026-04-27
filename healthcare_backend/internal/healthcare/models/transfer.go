package models

import "gorm.io/gorm"

// Transfer records an inter-ward transfer or final discharge of a patient.
// Type: Transfer | Discharge | Referral
type Transfer struct {
	gorm.Model
	AdmissionID   uint   `gorm:"column:admission_id;not null" json:"admission_id"`
	PatientID     uint   `gorm:"column:patient_id;not null" json:"patient_id"`
	Type          string `gorm:"column:type;not null" json:"type"` // Transfer | Discharge | Referral
	FromWard      string `gorm:"column:from_ward" json:"from_ward"`
	ToWard        string `gorm:"column:to_ward" json:"to_ward"` // empty on discharge
	Reason        string `gorm:"column:reason;type:text" json:"reason"`
	AuthorizedByID uint  `gorm:"column:authorized_by_id" json:"authorized_by_id"` // Doctor ID
	TransferredAt string `gorm:"column:transferred_at" json:"transferred_at"`
	Notes         string `gorm:"column:notes;type:text" json:"notes"`

	// Relationships
	Admission Admission `gorm:"foreignKey:AdmissionID" json:"admission,omitempty"`
	Patient   Patient   `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
}

func (Transfer) TableName() string {
	return "hc_transfers"
}
