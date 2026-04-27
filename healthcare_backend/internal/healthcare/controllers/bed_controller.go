package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// BedController handles IPD bed/ward management endpoints.
type BedController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/ipd/beds
// Supports filter: ward_name, status
func (ctrl *BedController) Index(c *gin.Context) {
	var beds []models.Bed
	db := ctrl.DB.Preload("Admission.Patient")

	if ward := c.Query("ward_name"); ward != "" {
		db = db.Where("ward_name = ?", ward)
	}
	if status := c.Query("status"); status != "" {
		db = db.Where("status = ?", status)
	}

	if err := db.Order("ward_name ASC, bed_number ASC").Find(&beds).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch beds"})
		return
	}

	// Build occupancy summary
	var summary struct {
		Total     int64 `json:"total"`
		Available int64 `json:"available"`
		Occupied  int64 `json:"occupied"`
	}
	ctrl.DB.Model(&models.Bed{}).Count(&summary.Total)
	ctrl.DB.Model(&models.Bed{}).Where("status = 'Available'").Count(&summary.Available)
	ctrl.DB.Model(&models.Bed{}).Where("status = 'Occupied'").Count(&summary.Occupied)

	c.JSON(http.StatusOK, gin.H{"data": beds, "occupancy": summary})
}

// Update handles PUT /api/v1/ipd/beds/:id
// Used to assign (Occupied) or free (Available) a bed.
func (ctrl *BedController) Update(c *gin.Context) {
	id := c.Param("id")
	var bed models.Bed
	if err := ctrl.DB.First(&bed, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bed not found"})
		return
	}

	var req struct {
		Status      string `json:"status"`      // Available | Occupied | Maintenance
		AdmissionID *uint  `json:"admission_id"` // set when assigning to a patient
		WardName    string `json:"ward_name"`
		BedType     string `json:"bed_type"`
		Floor       string `json:"floor"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Status != "" {
		bed.Status = req.Status
	}
	if req.AdmissionID != nil {
		bed.AdmissionID = req.AdmissionID
	}
	// Freeing a bed clears the admission link
	if req.Status == "Available" {
		bed.AdmissionID = nil
	}
	if req.WardName != "" {
		bed.WardName = req.WardName
	}
	if req.BedType != "" {
		bed.BedType = req.BedType
	}
	if req.Floor != "" {
		bed.Floor = req.Floor
	}

	if err := ctrl.DB.Save(&bed).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bed updated", "data": bed})
}

// Store handles POST /api/v1/ipd/beds (admin: add a new bed)
func (ctrl *BedController) Store(c *gin.Context) {
	var req struct {
		WardName  string `json:"ward_name" binding:"required"`
		BedNumber string `json:"bed_number" binding:"required"`
		BedType   string `json:"bed_type"`
		Floor     string `json:"floor"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bed := models.Bed{
		WardName:  req.WardName,
		BedNumber: req.BedNumber,
		BedType:   req.BedType,
		Floor:     req.Floor,
		Status:    "Available",
	}
	if err := ctrl.DB.Create(&bed).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create bed"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Bed created", "data": bed})
}
