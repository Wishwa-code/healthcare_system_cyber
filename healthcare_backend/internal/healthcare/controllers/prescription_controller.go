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

// Index handles GET /api/v1/opd/prescriptions
func (ctrl *PrescriptionController) Index(c *gin.Context) {
	var prescriptions []models.Prescription
	db := ctrl.DB.Preload("Dispenses")
	if consultationID := c.Query("consultation_id"); consultationID != "" {
		db = db.Where("consultation_id = ?", consultationID)
	}
	if admissionID := c.Query("admission_id"); admissionID != "" {
		db = db.Where("admission_id = ?", admissionID)
	}
	if patientID := c.Query("patient_id"); patientID != "" {
		db = db.Where(
			"consultation_id IN (SELECT id FROM hc_opd_consultations WHERE appointment_id IN (SELECT id FROM hc_appointments WHERE patient_id = ?)) OR admission_id IN (SELECT id FROM hc_admissions WHERE patient_id = ?)",
			patientID, patientID,
		)
	}
	if err := db.Order("created_at DESC").Find(&prescriptions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prescriptions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": prescriptions})
}

// Update handles PUT /api/v1/opd/prescriptions/:id
func (ctrl *PrescriptionController) Update(c *gin.Context) {
	id := c.Param("id")
	var prescription models.Prescription
	if err := ctrl.DB.First(&prescription, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	var req struct {
		Notes        string `json:"notes"`
		PrescribedBy uint   `json:"prescribed_by"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Notes != "" {
		prescription.Notes = req.Notes
	}
	if req.PrescribedBy != 0 {
		prescription.PrescribedBy = req.PrescribedBy
	}

	if err := ctrl.DB.Save(&prescription).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update prescription"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Prescription updated", "data": prescription})
}
