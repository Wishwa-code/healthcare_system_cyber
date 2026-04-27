package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// NursingNoteController handles IPD nursing notes endpoints.
type NursingNoteController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/ipd/nursing-notes
// Filter: patient_id, ward_name, admission_id
func (ctrl *NursingNoteController) Index(c *gin.Context) {
	var notes []models.NursingNote
	db := ctrl.DB.Preload("Patient").Preload("Admission")

	if patientID := c.Query("patient_id"); patientID != "" {
		db = db.Where("patient_id = ?", patientID)
	}
	if ward := c.Query("ward_name"); ward != "" {
		db = db.Where("ward_name = ?", ward)
	}
	if admissionID := c.Query("admission_id"); admissionID != "" {
		db = db.Where("admission_id = ?", admissionID)
	}

	if err := db.Order("recorded_at DESC").Find(&notes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch nursing notes"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": notes})
}

// Store handles POST /api/v1/ipd/nursing-notes
func (ctrl *NursingNoteController) Store(c *gin.Context) {
	var req struct {
		PatientID   uint   `json:"patient_id" binding:"required"`
		AdmissionID *uint  `json:"admission_id"`
		WardName    string `json:"ward_name"`
		NurseID     uint   `json:"nurse_id"`
		Shift       string `json:"shift"`
		Note        string `json:"note" binding:"required"`
		RecordedAt  string `json:"recorded_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	note := models.NursingNote{
		PatientID:   req.PatientID,
		AdmissionID: req.AdmissionID,
		WardName:    req.WardName,
		NurseID:     req.NurseID,
		Shift:       req.Shift,
		Note:        req.Note,
		RecordedAt:  req.RecordedAt,
	}
	if err := ctrl.DB.Create(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add nursing note"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Nursing note added", "data": note})
}
