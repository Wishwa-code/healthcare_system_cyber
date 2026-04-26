package models

import "gorm.io/gorm"

// InventoryStockIn records a restocking event from a supplier.
type InventoryStockIn struct {
	gorm.Model
	InventoryID uint    `gorm:"column:inventory_id;not null" json:"inventory_id"`
	SupplierID  uint    `gorm:"column:supplier_id;not null" json:"supplier_id"`
	Quantity    int     `gorm:"column:quantity;not null" json:"quantity"`
	UnitCost    float64 `gorm:"column:unit_cost;type:decimal(12,2)" json:"unit_cost"`
	ReceivedAt  string  `gorm:"column:received_at" json:"received_at"`
	BatchNumber string  `gorm:"column:batch_number" json:"batch_number"`
	ExpiryDate  string  `gorm:"column:expiry_date" json:"expiry_date"`

	// Relationships
	Inventory Inventory  `gorm:"foreignKey:InventoryID" json:"inventory,omitempty"`
	Supplier  HCSupplier `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
}

func (InventoryStockIn) TableName() string {
	return "hc_inventory_stock_ins"
}
