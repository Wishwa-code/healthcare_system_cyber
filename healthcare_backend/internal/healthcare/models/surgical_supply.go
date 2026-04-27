package models

import "gorm.io/gorm"

// SurgicalSupply tracks disposable/reusable surgical supplies (separate from medicines).
type SurgicalSupply struct {
	gorm.Model
	ItemName      string  `gorm:"column:item_name;not null" json:"item_name"`
	Category      string  `gorm:"column:category" json:"category"`       // e.g., Consumable, Instrument
	Unit          string  `gorm:"column:unit" json:"unit"`               // e.g., Piece, Box, Pack
	StockQuantity int     `gorm:"column:stock_quantity;default:0" json:"stock_quantity"`
	ReorderLevel  int     `gorm:"column:reorder_level;default:10" json:"reorder_level"`
	UnitPrice     float64 `gorm:"column:unit_price;type:decimal(12,2)" json:"unit_price"`
	ExpiryDate    string  `gorm:"column:expiry_date" json:"expiry_date"`
	Manufacturer  string  `gorm:"column:manufacturer" json:"manufacturer"`
	BatchNumber   string  `gorm:"column:batch_number" json:"batch_number"`
}

func (SurgicalSupply) TableName() string {
	return "hc_surgical_supplies"
}
