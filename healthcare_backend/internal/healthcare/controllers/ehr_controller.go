package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EHRController struct {
	DB *gorm.DB
}

// Get handles GET /api/v1/healthcare/patients/:id/ehr
func (ctrl *EHRController) Get(c *gin.Context) {
	patientID := c.Param("id")
	var record models.EHRRecord
	if err := ctrl.DB.Where("patient_id = ?", patientID).First(&record).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EHR record not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": record})
}

// Upsert handles POST /api/v1/healthcare/patients/:id/ehr
// Creates or updates the EHR for a patient.
func (ctrl *EHRController) Upsert(c *gin.Context) {
	patientID := c.Param("id")

	// Verify patient exists
	var patient models.Patient
	if err := ctrl.DB.First(&patient, patientID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	var req struct {
		Allergies      string `json:"allergies"`
		MedicalHistory string `json:"medical_history"`
		Immunizations  string `json:"immunizations"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var record models.EHRRecord
	result := ctrl.DB.Where("patient_id = ?", patient.ID).First(&record)

	if result.Error != nil {
		// Create new record
		record = models.EHRRecord{
			PatientID:      patient.ID,
			Allergies:      req.Allergies,
			MedicalHistory: req.MedicalHistory,
			Immunizations:  req.Immunizations,
		}
		if err := ctrl.DB.Create(&record).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create EHR record"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "EHR record created", "data": record})
		return
	}

	// Update existing
	record.Allergies = req.Allergies
	record.MedicalHistory = req.MedicalHistory
	record.Immunizations = req.Immunizations
	if err := ctrl.DB.Save(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update EHR record"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "EHR record updated", "data": record})
}
