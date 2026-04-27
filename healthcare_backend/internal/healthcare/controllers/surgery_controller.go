package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SurgeryController handles IPD surgery scheduling endpoints.
type SurgeryController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/ipd/surgeries
func (ctrl *SurgeryController) Index(c *gin.Context) {
	var surgeries []models.Surgery
	db := ctrl.DB.Preload("Patient").Preload("Surgeon").Preload("Admission")

	if patientID := c.Query("patient_id"); patientID != "" {
		db = db.Where("patient_id = ?", patientID)
	}
	if status := c.Query("status"); status != "" {
		db = db.Where("status = ?", status)
	}
	if date := c.Query("date"); date != "" {
		db = db.Where("scheduled_time LIKE ?", date+"%")
	}

	if err := db.Order("scheduled_time ASC").Find(&surgeries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch surgeries"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": surgeries})
}

// Store handles POST /api/v1/ipd/surgeries
func (ctrl *SurgeryController) Store(c *gin.Context) {
	var req struct {
		PatientID     uint   `json:"patient_id" binding:"required"`
		AdmissionID   *uint  `json:"admission_id"`
		SurgeonID     uint   `json:"surgeon_id" binding:"required"`
		SurgeryName   string `json:"surgery_name" binding:"required"`
		ScheduledTime string `json:"scheduled_time" binding:"required"`
		OTRoom        string `json:"ot_room"`
		Notes         string `json:"notes"`
		Duration      int    `json:"duration"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	surgery := models.Surgery{
		PatientID:     req.PatientID,
		AdmissionID:   req.AdmissionID,
		SurgeonID:     req.SurgeonID,
		SurgeryName:   req.SurgeryName,
		ScheduledTime: req.ScheduledTime,
		OTRoom:        req.OTRoom,
		Status:        "Scheduled",
		Notes:         req.Notes,
		Duration:      req.Duration,
	}
	if err := ctrl.DB.Create(&surgery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to schedule surgery"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Surgery scheduled", "data": surgery})
}
