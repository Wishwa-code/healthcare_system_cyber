package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PrescriptionController struct {
	DB *gorm.DB
}

// Store handles POST /api/v1/healthcare/prescriptions
func (ctrl *PrescriptionController) Store(c *gin.Context) {
	var req struct {
		ConsultationID *uint  `json:"consultation_id"`
		AdmissionID    *uint  `json:"admission_id"`
		PrescribedBy   uint   `json:"prescribed_by" binding:"required"`
		Notes          string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.ConsultationID == nil && req.AdmissionID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Either consultation_id or admission_id is required"})
		return
	}

	prescription := models.Prescription{
		ConsultationID: req.ConsultationID,
		AdmissionID:    req.AdmissionID,
		PrescribedBy:   req.PrescribedBy,
		Notes:          req.Notes,
	}
	if err := ctrl.DB.Create(&prescription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Prescription created", "data": prescription})
}

// Get handles GET /api/v1/healthcare/prescriptions/:id
func (ctrl *PrescriptionController) Get(c *gin.Context) {
	id := c.Param("id")
	var prescription models.Prescription
	if err := ctrl.DB.Preload("Dispenses.Inventory").First(&prescription, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": prescription})
}

// Index handles GET /api/v1/healthcare/prescriptions
func (ctrl *PrescriptionController) Index(c *gin.Context) {
	var prescriptions []models.Prescription
	db := ctrl.DB
	if consultationID := c.Query("consultation_id"); consultationID != "" {
		db = db.Where("consultation_id = ?", consultationID)
	}
	if admissionID := c.Query("admission_id"); admissionID != "" {
		db = db.Where("admission_id = ?", admissionID)
	}
	if err := db.Find(&prescriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prescriptions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": prescriptions})
}
