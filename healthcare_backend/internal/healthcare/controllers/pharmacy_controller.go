package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PharmacyController handles pharmacy prescription dispensing, stock, expiry, and supplies.
type PharmacyController struct {
	DB *gorm.DB
}

// ─────────────────────────────────────────────────────────────────────────────
// Prescription Dispensing
// ─────────────────────────────────────────────────────────────────────────────

// GetPrescriptions handles GET /api/v1/pharmacy/prescriptions
// Filter: status (pending|dispensed), patient_id
func (ctrl *PharmacyController) GetPrescriptions(c *gin.Context) {
	var prescriptions []models.Prescription
	db := ctrl.DB.
		Preload("Consultation.Appointment.Patient").
		Preload("Admission.Patient").
		Preload("Dispenses")

	if patientID := c.Query("patient_id"); patientID != "" {
		db = db.Where(
			"consultation_id IN (SELECT id FROM hc_opd_consultations WHERE appointment_id IN (SELECT id FROM hc_appointments WHERE patient_id = ?)) OR admission_id IN (SELECT id FROM hc_admissions WHERE patient_id = ?)",
			patientID, patientID,
		)
	}

	// "pending" = no dispense records yet; "dispensed" = has at least one
	if status := c.Query("status"); status == "pending" {
		db = db.Where("id NOT IN (SELECT DISTINCT prescription_id FROM hc_pharmacy_dispenses)")
	} else if status == "dispensed" {
		db = db.Where("id IN (SELECT DISTINCT prescription_id FROM hc_pharmacy_dispenses)")
	}

	if err := db.Order("created_at DESC").Find(&prescriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prescriptions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": prescriptions})
}

// DispensePrescription handles PUT /api/v1/pharmacy/prescriptions/:id/dispense
func (ctrl *PharmacyController) DispensePrescription(c *gin.Context) {
	prescriptionID := c.Param("id")

	var req struct {
		Items []struct {
			InventoryID uint    `json:"inventory_id" binding:"required"`
			Quantity    int     `json:"quantity" binding:"required"`
			UnitPrice   float64 `json:"unit_price"`
		} `json:"items" binding:"required"`
		DispensedBy uint   `json:"dispensed_by"`
		DispensedAt string `json:"dispensed_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dispensedAt := req.DispensedAt
	if dispensedAt == "" {
		dispensedAt = time.Now().Format(time.RFC3339)
	}

	tx := ctrl.DB.Begin()
	var dispenses []models.PharmacyDispense

	for _, item := range req.Items {
		var inv models.Inventory
		if err := tx.First(&inv, item.InventoryID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "Inventory item not found", "id": item.InventoryID})
			return
		}
		if inv.StockQuantity < item.Quantity {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock", "item": inv.ItemName})
			return
		}
		inv.StockQuantity -= item.Quantity
		if err := tx.Save(&inv).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deduct stock"})
			return
		}

		pID := uint(0)
		if pid, err := parseUint(prescriptionID); err == nil {
			pID = pid
		}

		dispense := models.PharmacyDispense{
			PrescriptionID: pID,
			InventoryID:    item.InventoryID,
			Quantity:       item.Quantity,
			DispensedBy:    req.DispensedBy,
			DispensedAt:    dispensedAt,
			UnitPrice:      item.UnitPrice,
		}
		if err := tx.Create(&dispense).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record dispense"})
			return
		}
		dispenses = append(dispenses, dispense)
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Prescription dispensed", "data": dispenses})
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock Management
// ─────────────────────────────────────────────────────────────────────────────

// GetStock handles GET /api/v1/pharmacy/stock
func (ctrl *PharmacyController) GetStock(c *gin.Context) {
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
		db = db.Where("stock_quantity < 10")
	}
	if err := db.Order("item_name ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stock"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": items})
}

// AddStock handles POST /api/v1/pharmacy/stock
func (ctrl *PharmacyController) AddStock(c *gin.Context) {
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add stock item"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Stock item added", "data": item})
}

// UpdateStock handles PUT /api/v1/pharmacy/stock/:id
func (ctrl *PharmacyController) UpdateStock(c *gin.Context) {
	id := c.Param("id")
	var item models.Inventory
	if err := ctrl.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Stock item not found"})
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
	if req.ItemName != "" {
		item.ItemName = req.ItemName
	}
	item.StockQuantity = req.StockQuantity
	if req.ExpiryDate != "" {
		item.ExpiryDate = req.ExpiryDate
	}
	item.Price = req.Price
	if req.Category != "" {
		item.Category = req.Category
	}
	if req.Unit != "" {
		item.Unit = req.Unit
	}
	if err := ctrl.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stock updated", "data": item})
}

// DeleteStock handles DELETE /api/v1/pharmacy/stock/:id
func (ctrl *PharmacyController) DeleteStock(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.DB.Delete(&models.Inventory{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove stock item"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Stock item removed"})
}

// ─────────────────────────────────────────────────────────────────────────────
// Expiry Alerts
// ─────────────────────────────────────────────────────────────────────────────

// GetExpiryAlerts handles GET /api/v1/pharmacy/expiry-alerts
// Query param: days (30 | 60 | 90, default 30)
func (ctrl *PharmacyController) GetExpiryAlerts(c *gin.Context) {
	days := c.DefaultQuery("days", "30")
	var items []models.Inventory

	// Filter items expiring within the given days window; exclude already-expired
	query := `
		expiry_date IS NOT NULL
		AND expiry_date != ''
		AND expiry_date::date <= CURRENT_DATE + (? || ' days')::interval
		AND expiry_date::date >= CURRENT_DATE
	`
	if err := ctrl.DB.Where(query, days).Order("expiry_date ASC").Find(&items).Error; err != nil {
		// Fallback for non-Postgres string comparison
		ctrl.DB.Where("expiry_date IS NOT NULL AND expiry_date != ''").
			Order("expiry_date ASC").Find(&items)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   items,
		"window": days + " days",
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// Surgical Supplies
// ─────────────────────────────────────────────────────────────────────────────

// GetSupplies handles GET /api/v1/pharmacy/supplies
func (ctrl *PharmacyController) GetSupplies(c *gin.Context) {
	var supplies []models.SurgicalSupply
	db := ctrl.DB
	if q := c.Query("query"); q != "" {
		like := "%" + q + "%"
		db = db.Where("item_name ILIKE ? OR category ILIKE ?", like, like)
	}
	if c.Query("low_stock") == "true" {
		db = db.Where("stock_quantity <= reorder_level")
	}
	if err := db.Order("item_name ASC").Find(&supplies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch supplies"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": supplies})
}

// AddSupply handles POST /api/v1/pharmacy/supplies
func (ctrl *PharmacyController) AddSupply(c *gin.Context) {
	var req struct {
		ItemName      string  `json:"item_name" binding:"required"`
		Category      string  `json:"category"`
		Unit          string  `json:"unit"`
		StockQuantity int     `json:"stock_quantity"`
		ReorderLevel  int     `json:"reorder_level"`
		UnitPrice     float64 `json:"unit_price"`
		ExpiryDate    string  `json:"expiry_date"`
		Manufacturer  string  `json:"manufacturer"`
		BatchNumber   string  `json:"batch_number"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	supply := models.SurgicalSupply{
		ItemName:      req.ItemName,
		Category:      req.Category,
		Unit:          req.Unit,
		StockQuantity: req.StockQuantity,
		ReorderLevel:  req.ReorderLevel,
		UnitPrice:     req.UnitPrice,
		ExpiryDate:    req.ExpiryDate,
		Manufacturer:  req.Manufacturer,
		BatchNumber:   req.BatchNumber,
	}
	if err := ctrl.DB.Create(&supply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add supply"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Supply added", "data": supply})
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

func parseUint(s string) (uint, error) {
	v, err := strconv.ParseUint(s, 10, 64)
	return uint(v), err
}
