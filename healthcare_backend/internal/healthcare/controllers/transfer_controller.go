package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// TransferController handles IPD transfers and discharges.
type TransferController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/ipd/transfers
// Filter: patient_id, admission_id, type (Transfer|Discharge|Referral)
func (ctrl *TransferController) Index(c *gin.Context) {
	var transfers []models.Transfer
	db := ctrl.DB.Preload("Patient").Preload("Admission")

	if patientID := c.Query("patient_id"); patientID != "" {
		db = db.Where("patient_id = ?", patientID)
	}
	if admissionID := c.Query("admission_id"); admissionID != "" {
		db = db.Where("admission_id = ?", admissionID)
	}
	if t := c.Query("type"); t != "" {
		db = db.Where("type = ?", t)
	}

	if err := db.Order("transferred_at DESC").Find(&transfers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transfers"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": transfers})
}

// Store handles POST /api/v1/ipd/transfers
// Records either a transfer between wards or a final discharge.
func (ctrl *TransferController) Store(c *gin.Context) {
	var req struct {
		AdmissionID    uint   `json:"admission_id" binding:"required"`
		PatientID      uint   `json:"patient_id" binding:"required"`
		Type           string `json:"type" binding:"required"` // Transfer | Discharge | Referral
		FromWard       string `json:"from_ward"`
		ToWard         string `json:"to_ward"`
		Reason         string `json:"reason"`
		AuthorizedByID uint   `json:"authorized_by_id"`
		TransferredAt  string `json:"transferred_at"`
		Notes          string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transfer := models.Transfer{
		AdmissionID:    req.AdmissionID,
		PatientID:      req.PatientID,
		Type:           req.Type,
		FromWard:       req.FromWard,
		ToWard:         req.ToWard,
		Reason:         req.Reason,
		AuthorizedByID: req.AuthorizedByID,
		TransferredAt:  req.TransferredAt,
		Notes:          req.Notes,
	}
	if err := ctrl.DB.Create(&transfer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record transfer"})
		return
	}

	// If it's a Discharge, update the admission record
	if req.Type == "Discharge" {
		ctrl.DB.Model(&models.Admission{}).Where("id = ?", req.AdmissionID).
			Update("discharge_date", req.TransferredAt)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Transfer recorded", "data": transfer})
}
