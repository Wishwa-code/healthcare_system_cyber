package models

import "gorm.io/gorm"

// Supplier represents a pharmacy/medical supply vendor.
type HCSupplier struct {
	gorm.Model
	Name      string `gorm:"column:name;not null" json:"name"`
	ContactNo string `gorm:"column:contact_no" json:"contact_no"`
	Email     string `gorm:"column:email" json:"email"`
	Address   string `gorm:"column:address;type:text" json:"address"`

	// Relationships
	StockIns []InventoryStockIn `gorm:"foreignKey:SupplierID" json:"stock_ins,omitempty"`
}

func (HCSupplier) TableName() string {
	return "hc_suppliers"
}
