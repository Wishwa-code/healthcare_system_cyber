package models

import "gorm.io/gorm"

// PharmacyDispense records a medication dispensing event triggered by a prescription.
type PharmacyDispense struct {
	gorm.Model
	PrescriptionID uint    `gorm:"column:prescription_id;not null" json:"prescription_id"`
	InventoryID    uint    `gorm:"column:inventory_id;not null" json:"inventory_id"`
	Quantity       int     `gorm:"column:quantity;not null" json:"quantity"`
	DispensedAt    string  `gorm:"column:dispensed_at" json:"dispensed_at"`
	DispensedBy    uint    `gorm:"column:dispensed_by" json:"dispensed_by"` // Staff user ID
	UnitPrice      float64 `gorm:"column:unit_price;type:decimal(12,2)" json:"unit_price"`

	// Relationships
	Prescription Prescription `gorm:"foreignKey:PrescriptionID" json:"prescription,omitempty"`
	Inventory    Inventory    `gorm:"foreignKey:InventoryID" json:"inventory,omitempty"`
}

func (PharmacyDispense) TableName() string {
	return "hc_pharmacy_dispenses"
}
