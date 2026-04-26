package controllers

import (
	"fmt"
	"garment-management-backend/internal/healthcare/models"
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PatientController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/patients  (also /api/v1/healthcare/patients)
// Query params: search, gender, blood_group, page, per_page
func (ctrl *PatientController) Index(c *gin.Context) {
	db := ctrl.DB.Model(&models.Patient{})

	// Accept both "search" and legacy "query" param
	if s := c.Query("search"); s != "" {
		like := "%" + s + "%"
		db = db.Where("full_name LIKE ? OR contact_info LIKE ?", like, like)
	} else if q := c.Query("query"); q != "" {
		like := "%" + q + "%"
		db = db.Where("full_name LIKE ? OR contact_info LIKE ?", like, like)
	}

	if gender := c.Query("gender"); gender != "" {
		db = db.Where("gender = ?", gender)
	}

	if bg := c.Query("blood_group"); bg != "" {
		db = db.Where("blood_group = ?", bg)
	}

	// Pagination defaults
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "15"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 15
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count patients"})
		return
	}

	var patients []models.Patient
	offset := (page - 1) * perPage
	if err := db.Offset(offset).Limit(perPage).Find(&patients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patients"})
		return
	}

	lastPage := int(math.Ceil(float64(total) / float64(perPage)))
	c.JSON(http.StatusOK, gin.H{
		"data": patients,
		"meta": gin.H{
			"total":     total,
			"page":      page,
			"per_page":  perPage,
			"last_page": lastPage,
		},
	})
}

// Store handles POST /api/v1/patients
func (ctrl *PatientController) Store(c *gin.Context) {
	var req struct {
		FullName    string `json:"full_name" binding:"required"`
		BloodGroup  string `json:"blood_group"`
		DOB         string `json:"dob"`
		Gender      string `json:"gender"`
		ContactInfo string `json:"contact_info"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patient := models.Patient{
		FullName:    req.FullName,
		BloodGroup:  req.BloodGroup,
		DOB:         req.DOB,
		Gender:      req.Gender,
		ContactInfo: req.ContactInfo,
	}

	if err := ctrl.DB.Create(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Patient created successfully", "data": patient})
}

// Get handles GET /api/v1/patients/:id
// Returns patient + preloaded EHR snapshot
func (ctrl *PatientController) Get(c *gin.Context) {
	id := c.Param("id")
	var patient models.Patient
	if err := ctrl.DB.Preload("EHRRecord").Preload("Appointments").Preload("Admissions").
		First(&patient, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": patient})
}

// Update handles PUT /api/v1/patients/:id
func (ctrl *PatientController) Update(c *gin.Context) {
	id := c.Param("id")
	var patient models.Patient
	if err := ctrl.DB.First(&patient, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	var req struct {
		FullName    string `json:"full_name"`
		BloodGroup  string `json:"blood_group"`
		DOB         string `json:"dob"`
		Gender      string `json:"gender"`
		ContactInfo string `json:"contact_info"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patient.FullName = req.FullName
	patient.BloodGroup = req.BloodGroup
	patient.DOB = req.DOB
	patient.Gender = req.Gender
	patient.ContactInfo = req.ContactInfo

	if err := ctrl.DB.Save(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Patient updated successfully", "data": patient})
}

// Destroy handles DELETE /api/v1/patients/:id  (GORM soft-delete)
func (ctrl *PatientController) Destroy(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.DB.Delete(&models.Patient{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete patient"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Patient deleted successfully"})
}

// GenerateID handles GET /api/v1/patients/generate-id
func (ctrl *PatientController) GenerateID(c *gin.Context) {
	var count int64
	ctrl.DB.Model(&models.Patient{}).Count(&count)
	code := fmt.Sprintf("PAT-%05d", count+1)
	c.JSON(http.StatusOK, gin.H{"patient_id": code})
}
