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

// ─── Helper ────────────────────────────────────────────────────────────────

// findOrInitEHR looks up the EHR record for a patient.
// If the patient does not exist it writes a 404 and returns nil, false.
func (ctrl *EHRController) findOrInitEHR(c *gin.Context) (*models.EHRRecord, bool) {
	patientID := c.Param("id")

	// Verify patient exists
	var patient models.Patient
	if err := ctrl.DB.First(&patient, patientID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return nil, false
	}

	var record models.EHRRecord
	ctrl.DB.Where("patient_id = ?", patient.ID).First(&record)
	// It's fine if the record doesn't exist yet – callers decide what to do.
	record.PatientID = patient.ID
	return &record, true
}

// ─── Full EHR endpoints ────────────────────────────────────────────────────

// Get handles GET /api/v1/patients/:id/ehr
// Returns the complete EHR record (allergies + history + immunizations).
func (ctrl *EHRController) Get(c *gin.Context) {
	patientID := c.Param("id")
	var record models.EHRRecord
	if err := ctrl.DB.Where("patient_id = ?", patientID).First(&record).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EHR record not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": record})
}

// Upsert handles PUT /api/v1/patients/:id/ehr  (also POST for backward compat)
// Creates or updates the entire EHR record.
func (ctrl *EHRController) Upsert(c *gin.Context) {
	record, ok := ctrl.findOrInitEHR(c)
	if !ok {
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

	record.Allergies = req.Allergies
	record.MedicalHistory = req.MedicalHistory
	record.Immunizations = req.Immunizations

	if record.ID == 0 {
		// New record
		if err := ctrl.DB.Create(record).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create EHR record"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "EHR record created", "data": record})
		return
	}

	// Update existing
	if err := ctrl.DB.Save(record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update EHR record"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "EHR record updated", "data": record})
}

// ─── Medical History sub-resource ─────────────────────────────────────────

// GetHistory handles GET /api/v1/patients/:id/history
// Returns only the medical_history field from the EHR record.
func (ctrl *EHRController) GetHistory(c *gin.Context) {
	patientID := c.Param("id")
	var record models.EHRRecord
	if err := ctrl.DB.Where("patient_id = ?", patientID).First(&record).Error; err != nil {
		// Return an empty history rather than 404 so the UI renders gracefully
		c.JSON(http.StatusOK, gin.H{"data": gin.H{"patient_id": patientID, "medical_history": ""}})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"patient_id":      record.PatientID,
			"medical_history": record.MedicalHistory,
		},
	})
}

// ─── Allergies & Immunizations sub-resource ────────────────────────────────

// GetAllergies handles GET /api/v1/patients/:id/allergies
// Returns allergies and immunizations fields from the EHR record.
func (ctrl *EHRController) GetAllergies(c *gin.Context) {
	patientID := c.Param("id")
	var record models.EHRRecord
	if err := ctrl.DB.Where("patient_id = ?", patientID).First(&record).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"patient_id":    patientID,
				"allergies":     "",
				"immunizations": "",
			},
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"patient_id":    record.PatientID,
			"allergies":     record.Allergies,
			"immunizations": record.Immunizations,
		},
	})
}

// UpsertAllergies handles PUT /api/v1/patients/:id/allergies
// Updates only the allergies and immunizations fields of the EHR record.
func (ctrl *EHRController) UpsertAllergies(c *gin.Context) {
	record, ok := ctrl.findOrInitEHR(c)
	if !ok {
		return
	}

	var req struct {
		Allergies     string `json:"allergies"`
		Immunizations string `json:"immunizations"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	record.Allergies = req.Allergies
	record.Immunizations = req.Immunizations

	if record.ID == 0 {
		if err := ctrl.DB.Create(record).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create EHR record"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{
			"message": "Allergies record created",
			"data": gin.H{
				"patient_id":    record.PatientID,
				"allergies":     record.Allergies,
				"immunizations": record.Immunizations,
			},
		})
		return
	}

	if err := ctrl.DB.Model(record).Updates(map[string]interface{}{
		"allergies":     record.Allergies,
		"immunizations": record.Immunizations,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update allergies"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Allergies updated",
		"data": gin.H{
			"patient_id":    record.PatientID,
			"allergies":     record.Allergies,
			"immunizations": record.Immunizations,
		},
	})
}
