package models

import "gorm.io/gorm"

// Inventory tracks medicine/supply stock in the hospital pharmacy.
type Inventory struct {
	gorm.Model
	ItemName      string  `gorm:"column:item_name;not null" json:"item_name"`
	StockQuantity int     `gorm:"column:stock_quantity;default:0" json:"stock_quantity"`
	ExpiryDate    string  `gorm:"column:expiry_date" json:"expiry_date"`
	Price         float64 `gorm:"column:price;type:decimal(12,2)" json:"price"`
	Category      string  `gorm:"column:category" json:"category"` // e.g., Medicine, Consumable
	Unit          string  `gorm:"column:unit" json:"unit"`         // e.g., Tablet, Vial, Box

	// Relationships
	Dispenses  []PharmacyDispense  `gorm:"foreignKey:InventoryID" json:"dispenses,omitempty"`
	StockIns   []InventoryStockIn  `gorm:"foreignKey:InventoryID" json:"stock_ins,omitempty"`
}

func (Inventory) TableName() string {
	return "hc_inventories"
}
