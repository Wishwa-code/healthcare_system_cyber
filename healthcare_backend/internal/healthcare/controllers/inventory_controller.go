package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type InventoryController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/healthcare/inventory
func (ctrl *InventoryController) Index(c *gin.Context) {
	var items []models.Inventory
	db := ctrl.DB
	if q := c.Query("query"); q != "" {
		like := "%" + q + "%"
		db = db.Where("item_name ILIKE ? OR category ILIKE ?", like, like)
	}
	if category := c.Query("category"); category != "" {
		db = db.Where("category = ?", category)
	}
	if c.Query("low_stock") == "true" {
		db = db.Where("stock_quantity < ?", 10)
	}
	if err := db.Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

// Store handles POST /api/v1/healthcare/inventory
func (ctrl *InventoryController) Store(c *gin.Context) {
	var req struct {
		ItemName      string  `json:"item_name" binding:"required"`
		StockQuantity int     `json:"stock_quantity"`
		ExpiryDate    string  `json:"expiry_date"`
		Price         float64 `json:"price"`
		Category      string  `json:"category"`
		Unit          string  `json:"unit"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item := models.Inventory{
		ItemName:      req.ItemName,
		StockQuantity: req.StockQuantity,
		ExpiryDate:    req.ExpiryDate,
		Price:         req.Price,
		Category:      req.Category,
		Unit:          req.Unit,
	}
	if err := ctrl.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create inventory item"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Inventory item created", "data": item})
}

// Update handles PUT /api/v1/healthcare/inventory/:id
func (ctrl *InventoryController) Update(c *gin.Context) {
	id := c.Param("id")
	var item models.Inventory
	if err := ctrl.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		return
	}

	var req struct {
		ItemName      string  `json:"item_name"`
		StockQuantity int     `json:"stock_quantity"`
		ExpiryDate    string  `json:"expiry_date"`
		Price         float64 `json:"price"`
		Category      string  `json:"category"`
		Unit          string  `json:"unit"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item.ItemName = req.ItemName
	item.StockQuantity = req.StockQuantity
	item.ExpiryDate = req.ExpiryDate
	item.Price = req.Price
	item.Category = req.Category
	item.Unit = req.Unit

	if err := ctrl.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update inventory item"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Inventory item updated", "data": item})
}

// Destroy handles DELETE /api/v1/healthcare/inventory/:id
func (ctrl *InventoryController) Destroy(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.DB.Delete(&models.Inventory{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete inventory item"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Inventory item deleted"})
}

// Dispense handles POST /api/v1/healthcare/inventory/:id/dispense
func (ctrl *InventoryController) Dispense(c *gin.Context) {
	id := c.Param("id")
	inventoryID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inventory ID"})
		return
	}

	var req struct {
		PrescriptionID uint    `json:"prescription_id" binding:"required"`
		Quantity       int     `json:"quantity" binding:"required"`
		DispensedBy    uint    `json:"dispensed_by"`
		DispensedAt    string  `json:"dispensed_at"`
		UnitPrice      float64 `json:"unit_price"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := ctrl.DB.Begin()

	// Check and deduct stock
	var item models.Inventory
	if err := tx.First(&item, inventoryID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		return
	}
	if item.StockQuantity < req.Quantity {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
		return
	}

	item.StockQuantity -= req.Quantity
	if err := tx.Save(&item).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
		return
	}

	dispense := models.PharmacyDispense{
		PrescriptionID: req.PrescriptionID,
		InventoryID:    uint(inventoryID),
		Quantity:       req.Quantity,
		DispensedBy:    req.DispensedBy,
		DispensedAt:    req.DispensedAt,
		UnitPrice:      req.UnitPrice,
	}
	if err := tx.Create(&dispense).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record dispense"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, gin.H{"message": "Item dispensed successfully", "data": dispense, "remaining_stock": item.StockQuantity})
}

// StockIn handles POST /api/v1/healthcare/inventory/:id/stock-in
func (ctrl *InventoryController) StockIn(c *gin.Context) {
	id := c.Param("id")
	inventoryID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid inventory ID"})
		return
	}

	var req struct {
		SupplierID  uint    `json:"supplier_id" binding:"required"`
		Quantity    int     `json:"quantity" binding:"required"`
		UnitCost    float64 `json:"unit_cost"`
		ReceivedAt  string  `json:"received_at"`
		BatchNumber string  `json:"batch_number"`
		ExpiryDate  string  `json:"expiry_date"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := ctrl.DB.Begin()

	var item models.Inventory
	if err := tx.First(&item, inventoryID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found"})
		return
	}

	item.StockQuantity += req.Quantity
	if err := tx.Save(&item).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
		return
	}

	stockIn := models.InventoryStockIn{
		InventoryID: uint(inventoryID),
		SupplierID:  req.SupplierID,
		Quantity:    req.Quantity,
		UnitCost:    req.UnitCost,
		ReceivedAt:  req.ReceivedAt,
		BatchNumber: req.BatchNumber,
		ExpiryDate:  req.ExpiryDate,
	}
	if err := tx.Create(&stockIn).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record stock in"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusCreated, gin.H{"message": "Stock added successfully", "data": stockIn, "new_stock": item.StockQuantity})
}
