package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DoctorController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/healthcare/doctors
func (ctrl *DoctorController) Index(c *gin.Context) {
	var doctors []models.Doctor
	db := ctrl.DB
	if q := c.Query("query"); q != "" {
		like := "%" + q + "%"
		db = db.Where("name ILIKE ? OR specialization ILIKE ?", like, like)
	}
	if err := db.Find(&doctors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch doctors"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": doctors})
}

// Store handles POST /api/v1/healthcare/doctors
func (ctrl *DoctorController) Store(c *gin.Context) {
	var req struct {
		Name           string `json:"name" binding:"required"`
		Specialization string `json:"specialization"`
		LicenseNo      string `json:"license_no"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	doctor := models.Doctor{
		Name:           req.Name,
		Specialization: req.Specialization,
		LicenseNo:      req.LicenseNo,
	}
	if err := ctrl.DB.Create(&doctor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create doctor"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Doctor created successfully", "data": doctor})
}

// Get handles GET /api/v1/healthcare/doctors/:id
func (ctrl *DoctorController) Get(c *gin.Context) {
	id := c.Param("id")
	var doctor models.Doctor
	if err := ctrl.DB.Preload("Availabilities").First(&doctor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": doctor})
}

// Update handles PUT /api/v1/healthcare/doctors/:id
func (ctrl *DoctorController) Update(c *gin.Context) {
	id := c.Param("id")
	var doctor models.Doctor
	if err := ctrl.DB.First(&doctor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}

	var req struct {
		Name           string `json:"name"`
		Specialization string `json:"specialization"`
		LicenseNo      string `json:"license_no"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	doctor.Name = req.Name
	doctor.Specialization = req.Specialization
	doctor.LicenseNo = req.LicenseNo
	if err := ctrl.DB.Save(&doctor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update doctor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Doctor updated successfully", "data": doctor})
}

// Destroy handles DELETE /api/v1/healthcare/doctors/:id
func (ctrl *DoctorController) Destroy(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.DB.Delete(&models.Doctor{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete doctor"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Doctor deleted successfully"})
}

// GetAvailability handles GET /api/v1/healthcare/doctors/:id/availability
func (ctrl *DoctorController) GetAvailability(c *gin.Context) {
	id := c.Param("id")
	var slots []models.DoctorAvailability
	if err := ctrl.DB.Where("doctor_id = ?", id).Find(&slots).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch availability"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": slots})
}

// AddAvailability handles POST /api/v1/healthcare/doctors/:id/availability
func (ctrl *DoctorController) AddAvailability(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		DayOfWeek string `json:"day_of_week" binding:"required"`
		StartTime string `json:"start_time" binding:"required"`
		EndTime   string `json:"end_time" binding:"required"`
		Location  string `json:"location"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify doctor exists
	var doctor models.Doctor
	if err := ctrl.DB.First(&doctor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor not found"})
		return
	}

	slot := models.DoctorAvailability{
		DoctorID:  doctor.ID,
		DayOfWeek: req.DayOfWeek,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Location:  req.Location,
	}
	if err := ctrl.DB.Create(&slot).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add availability slot"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Availability slot added", "data": slot})
}
