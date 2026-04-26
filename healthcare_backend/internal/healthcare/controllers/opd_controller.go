package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OPDController struct {
	DB *gorm.DB
}

// Store handles POST /api/v1/healthcare/opd-consultations
// Converts a completed appointment into an OPD consultation record.
func (ctrl *OPDController) Store(c *gin.Context) {
	var req struct {
		AppointmentID  uint   `json:"appointment_id" binding:"required"`
		ChiefComplaint string `json:"chief_complaint"`
		Diagnosis      string `json:"diagnosis"`
		VitalSigns     string `json:"vital_signs"`
		FollowUpDate   string `json:"follow_up_date"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	consultation := models.OPDConsultation{
		AppointmentID:  req.AppointmentID,
		ChiefComplaint: req.ChiefComplaint,
		Diagnosis:      req.Diagnosis,
		VitalSigns:     req.VitalSigns,
		FollowUpDate:   req.FollowUpDate,
	}
	if err := ctrl.DB.Create(&consultation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create OPD consultation"})
		return
	}

	// Mark appointment as completed
	ctrl.DB.Model(&models.Appointment{}).Where("id = ?", req.AppointmentID).
		Update("status", "Completed")

	c.JSON(http.StatusCreated, gin.H{"message": "OPD consultation created", "data": consultation})
}

// Get handles GET /api/v1/healthcare/opd-consultations/:id
func (ctrl *OPDController) Get(c *gin.Context) {
	id := c.Param("id")
	var consultation models.OPDConsultation
	if err := ctrl.DB.Preload("Appointment.Patient").Preload("Appointment.Doctor").
		Preload("Prescriptions").First(&consultation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "OPD consultation not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": consultation})
}

// Index handles GET /api/v1/healthcare/opd-consultations
func (ctrl *OPDController) Index(c *gin.Context) {
	var consultations []models.OPDConsultation
	db := ctrl.DB.Preload("Appointment.Patient").Preload("Appointment.Doctor")
	if err := db.Find(&consultations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch OPD consultations"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": consultations})
}
