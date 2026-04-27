package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// VitalController handles OPD vital signs endpoints.
type VitalController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/opd/vitals
func (ctrl *VitalController) Index(c *gin.Context) {
	var vitals []models.VitalSign
	db := ctrl.DB.Preload("Patient")

	if patientID := c.Query("patient_id"); patientID != "" {
		db = db.Where("patient_id = ?", patientID)
	}
	if from := c.Query("from"); from != "" {
		db = db.Where("recorded_at >= ?", from)
	}
	if to := c.Query("to"); to != "" {
		db = db.Where("recorded_at <= ?", to)
	}

	if err := db.Order("recorded_at DESC").Find(&vitals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vitals"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": vitals})
}

// Store handles POST /api/v1/opd/vitals
func (ctrl *VitalController) Store(c *gin.Context) {
	var req struct {
		PatientID        uint    `json:"patient_id" binding:"required"`
		RecordedByID     uint    `json:"recorded_by_id"`
		Temperature      float64 `json:"temperature"`
		BloodPressure    string  `json:"blood_pressure"`
		Pulse            int     `json:"pulse"`
		RespiratoryRate  int     `json:"respiratory_rate"`
		OxygenSaturation float64 `json:"oxygen_saturation"`
		Weight           float64 `json:"weight"`
		Height           float64 `json:"height"`
		Notes            string  `json:"notes"`
		RecordedAt       string  `json:"recorded_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vital := models.VitalSign{
		PatientID:        req.PatientID,
		RecordedByID:     req.RecordedByID,
		Temperature:      req.Temperature,
		BloodPressure:    req.BloodPressure,
		Pulse:            req.Pulse,
		RespiratoryRate:  req.RespiratoryRate,
		OxygenSaturation: req.OxygenSaturation,
		Weight:           req.Weight,
		Height:           req.Height,
		Notes:            req.Notes,
		RecordedAt:       req.RecordedAt,
	}
	if err := ctrl.DB.Create(&vital).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record vitals"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Vitals recorded", "data": vital})
}
