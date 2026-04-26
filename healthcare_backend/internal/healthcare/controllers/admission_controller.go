package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdmissionController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/healthcare/admissions
func (ctrl *AdmissionController) Index(c *gin.Context) {
	var admissions []models.Admission
	db := ctrl.DB.Preload("Patient")

	if patientID := c.Query("patient_id"); patientID != "" {
		db = db.Where("patient_id = ?", patientID)
	}
	// Active admissions (not yet discharged)
	if c.Query("active") == "true" {
		db = db.Where("discharge_date IS NULL OR discharge_date = ''")
	}

	if err := db.Find(&admissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admissions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": admissions})
}

// Store handles POST /api/v1/healthcare/admissions
func (ctrl *AdmissionController) Store(c *gin.Context) {
	var req struct {
		PatientID         uint   `json:"patient_id" binding:"required"`
		AdmissionDate     string `json:"admission_date" binding:"required"`
		AdmittingDoctorID *uint  `json:"admitting_doctor_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	admission := models.Admission{
		PatientID:         req.PatientID,
		AdmissionDate:     req.AdmissionDate,
		AdmittingDoctorID: req.AdmittingDoctorID,
	}
	if err := ctrl.DB.Create(&admission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create admission"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Admission created", "data": admission})
}

// Get handles GET /api/v1/healthcare/admissions/:id
func (ctrl *AdmissionController) Get(c *gin.Context) {
	id := c.Param("id")
	var admission models.Admission
	if err := ctrl.DB.Preload("Patient").Preload("WardAllocations").Preload("Prescriptions").
		First(&admission, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admission not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": admission})
}

// Discharge handles POST /api/v1/healthcare/admissions/:id/discharge
func (ctrl *AdmissionController) Discharge(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		DischargeDate    string `json:"discharge_date" binding:"required"`
		DischargeSummary string `json:"discharge_summary"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.DB.Model(&models.Admission{}).Where("id = ?", id).Updates(map[string]interface{}{
		"discharge_date":    req.DischargeDate,
		"discharge_summary": req.DischargeSummary,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to discharge patient"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Patient discharged successfully"})
}

// AllocateWard handles POST /api/v1/healthcare/admissions/:id/ward
func (ctrl *AdmissionController) AllocateWard(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		WardName    string `json:"ward_name" binding:"required"`
		BedNumber   string `json:"bed_number"`
		AllocatedAt string `json:"allocated_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var admission models.Admission
	if err := ctrl.DB.First(&admission, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admission not found"})
		return
	}

	allocation := models.WardAllocation{
		AdmissionID: admission.ID,
		WardName:    req.WardName,
		BedNumber:   req.BedNumber,
		AllocatedAt: req.AllocatedAt,
	}
	if err := ctrl.DB.Create(&allocation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to allocate ward"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Ward allocated", "data": allocation})
}
