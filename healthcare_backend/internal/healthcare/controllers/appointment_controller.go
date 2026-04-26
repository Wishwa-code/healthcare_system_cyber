package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AppointmentController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/healthcare/appointments
func (ctrl *AppointmentController) Index(c *gin.Context) {
	var appointments []models.Appointment
	db := ctrl.DB.Preload("Patient").Preload("Doctor")

	if patientID := c.Query("patient_id"); patientID != "" {
		db = db.Where("patient_id = ?", patientID)
	}
	if doctorID := c.Query("doctor_id"); doctorID != "" {
		db = db.Where("doctor_id = ?", doctorID)
	}
	if status := c.Query("status"); status != "" {
		db = db.Where("status = ?", status)
	}

	if err := db.Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": appointments})
}

// Store handles POST /api/v1/healthcare/appointments
func (ctrl *AppointmentController) Store(c *gin.Context) {
	var req struct {
		PatientID     uint   `json:"patient_id" binding:"required"`
		DoctorID      uint   `json:"doctor_id" binding:"required"`
		ScheduledTime string `json:"scheduled_time" binding:"required"`
		Notes         string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	appointment := models.Appointment{
		PatientID:     req.PatientID,
		DoctorID:      req.DoctorID,
		ScheduledTime: req.ScheduledTime,
		Status:        "Pending",
		Notes:         req.Notes,
	}
	if err := ctrl.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create appointment"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Appointment created", "data": appointment})
}

// Get handles GET /api/v1/healthcare/appointments/:id
func (ctrl *AppointmentController) Get(c *gin.Context) {
	id := c.Param("id")
	var appointment models.Appointment
	if err := ctrl.DB.Preload("Patient").Preload("Doctor").Preload("QueueEntries").
		First(&appointment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": appointment})
}

// UpdateStatus handles POST /api/v1/healthcare/appointments/:id/status
func (ctrl *AppointmentController) UpdateStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.DB.Model(&models.Appointment{}).Where("id = ?", id).
		Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Appointment status updated"})
}

// Destroy handles DELETE /api/v1/healthcare/appointments/:id
func (ctrl *AppointmentController) Destroy(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.DB.Delete(&models.Appointment{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted"})
}

// AddQueueEntry handles POST /api/v1/healthcare/appointments/:id/queue
func (ctrl *AppointmentController) AddQueueEntry(c *gin.Context) {
	id := c.Param("id")
	var appointment models.Appointment
	if err := ctrl.DB.First(&appointment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	// Determine the next queue number for this appointment
	var maxQueueNum int
	ctrl.DB.Model(&models.QueueEntry{}).
		Where("appointment_id = ?", appointment.ID).
		Select("COALESCE(MAX(queue_number), 0)").
		Scan(&maxQueueNum)

	entry := models.QueueEntry{
		AppointmentID: appointment.ID,
		QueueNumber:   maxQueueNum + 1,
		Status:        "Waiting",
	}
	if err := ctrl.DB.Create(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add queue entry"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Queue entry added", "data": entry})
}
