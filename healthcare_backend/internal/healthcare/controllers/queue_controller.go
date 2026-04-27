package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// QueueController handles the live appointment queue endpoints.
type QueueController struct {
	DB *gorm.DB
}

// GetQueue handles GET /api/v1/appointments/queue
// Returns today's queue entries with full appointment details.
func (ctrl *QueueController) GetQueue(c *gin.Context) {
	today := time.Now().Format("2006-01-02")

	var entries []models.QueueEntry
	db := ctrl.DB.
		Preload("Appointment.Patient").
		Preload("Appointment.Doctor").
		Joins("JOIN hc_appointments a ON a.id = hc_queue_entries.appointment_id").
		Where("DATE(a.scheduled_time::date) = ? OR a.scheduled_time LIKE ?", today, today+"%").
		Where("hc_queue_entries.deleted_at IS NULL")

	if doctorID := c.Query("doctor_id"); doctorID != "" {
		db = db.Where("a.doctor_id = ?", doctorID)
	}
	if status := c.Query("status"); status != "" {
		db = db.Where("hc_queue_entries.status = ?", status)
	}

	if err := db.Order("hc_queue_entries.queue_number ASC").Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch queue"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": entries, "date": today})
}

// UpdateQueueStatus handles PUT /api/v1/appointments/queue/:id/status
// Advances queue status: Waiting → Called → Completed / Skipped
func (ctrl *QueueController) UpdateQueueStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status   string `json:"status" binding:"required"` // Called | Completed | Skipped
		CalledAt string `json:"called_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{"status": req.Status}
	if req.CalledAt != "" {
		updates["called_at"] = req.CalledAt
	} else if req.Status == "Called" {
		updates["called_at"] = time.Now().Format(time.RFC3339)
	}

	if err := ctrl.DB.Model(&models.QueueEntry{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update queue status"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Queue status updated"})
}
