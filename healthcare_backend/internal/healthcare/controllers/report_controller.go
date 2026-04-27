package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ReportController handles all analytics and KPI reporting endpoints.
type ReportController struct {
	DB *gorm.DB
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/reports/overview
// ─────────────────────────────────────────────────────────────────────────────

// Overview handles GET /api/v1/reports/overview
// Returns aggregated KPIs: patients, appointments, admissions, revenue.
func (ctrl *ReportController) Overview(c *gin.Context) {
	period := c.DefaultQuery("period", "today") // today | week | month
	from, to := periodRange(period)

	var totalPatients, newPatients int64
	ctrl.DB.Model(&models.Patient{}).Count(&totalPatients)
	ctrl.DB.Model(&models.Patient{}).Where("created_at BETWEEN ? AND ?", from, to).Count(&newPatients)

	var totalAppointments, pendingAppointments, completedAppointments int64
	ctrl.DB.Model(&models.Appointment{}).
		Where("created_at BETWEEN ? AND ?", from, to).Count(&totalAppointments)
	ctrl.DB.Model(&models.Appointment{}).
		Where("status = 'Pending' AND created_at BETWEEN ? AND ?", from, to).Count(&pendingAppointments)
	ctrl.DB.Model(&models.Appointment{}).
		Where("status = 'Completed' AND created_at BETWEEN ? AND ?", from, to).Count(&completedAppointments)

	var activeAdmissions, totalAdmissions int64
	ctrl.DB.Model(&models.Admission{}).
		Where("discharge_date IS NULL OR discharge_date = ''").Count(&activeAdmissions)
	ctrl.DB.Model(&models.Admission{}).
		Where("created_at BETWEEN ? AND ?", from, to).Count(&totalAdmissions)

	var availableBeds, totalBeds int64
	ctrl.DB.Model(&models.Bed{}).Count(&totalBeds)
	ctrl.DB.Model(&models.Bed{}).Where("status = 'Available'").Count(&availableBeds)

	var pendingPrescriptions int64
	ctrl.DB.Model(&models.Prescription{}).
		Where("id NOT IN (SELECT DISTINCT prescription_id FROM hc_pharmacy_dispenses)").
		Count(&pendingPrescriptions)

	var lowStockItems int64
	ctrl.DB.Model(&models.Inventory{}).Where("stock_quantity < 10").Count(&lowStockItems)

	c.JSON(http.StatusOK, gin.H{
		"period": period,
		"range":  gin.H{"from": from, "to": to},
		"patients": gin.H{
			"total": totalPatients,
			"new":   newPatients,
		},
		"appointments": gin.H{
			"total":     totalAppointments,
			"pending":   pendingAppointments,
			"completed": completedAppointments,
		},
		"admissions": gin.H{
			"active": activeAdmissions,
			"period": totalAdmissions,
		},
		"beds": gin.H{
			"total":     totalBeds,
			"available": availableBeds,
			"occupied":  totalBeds - availableBeds,
		},
		"pharmacy": gin.H{
			"pending_prescriptions": pendingPrescriptions,
			"low_stock_items":       lowStockItems,
		},
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/reports/opd
// ─────────────────────────────────────────────────────────────────────────────

// OPDReport handles GET /api/v1/reports/opd
func (ctrl *ReportController) OPDReport(c *gin.Context) {
	period := c.DefaultQuery("period", "month")
	from, to := periodRange(period)

	var totalConsultations int64
	ctrl.DB.Model(&models.OPDConsultation{}).
		Where("created_at BETWEEN ? AND ?", from, to).Count(&totalConsultations)

	// Consultations per doctor
	type DoctorStat struct {
		DoctorID uint   `json:"doctor_id"`
		Name     string `json:"name"`
		Count    int64  `json:"count"`
	}
	var byDoctor []DoctorStat
	ctrl.DB.Raw(`
		SELECT a.doctor_id, d.name, COUNT(c.id) AS count
		FROM hc_opd_consultations c
		JOIN hc_appointments a ON a.id = c.appointment_id
		JOIN hc_doctors d ON d.id = a.doctor_id
		WHERE c.created_at BETWEEN ? AND ?
		AND c.deleted_at IS NULL
		GROUP BY a.doctor_id, d.name
		ORDER BY count DESC
	`, from, to).Scan(&byDoctor)

	// Vitals recorded in period
	var vitalsCount int64
	ctrl.DB.Model(&models.VitalSign{}).
		Where("created_at BETWEEN ? AND ?", from, to).Count(&vitalsCount)

	// Prescriptions issued in OPD
	var opdPrescriptions int64
	ctrl.DB.Model(&models.Prescription{}).
		Where("consultation_id IS NOT NULL AND created_at BETWEEN ? AND ?", from, to).
		Count(&opdPrescriptions)

	c.JSON(http.StatusOK, gin.H{
		"period":                period,
		"range":                 gin.H{"from": from, "to": to},
		"total_consultations":   totalConsultations,
		"by_doctor":             byDoctor,
		"vitals_recorded":       vitalsCount,
		"prescriptions_issued":  opdPrescriptions,
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/reports/ipd
// ─────────────────────────────────────────────────────────────────────────────

// IPDReport handles GET /api/v1/reports/ipd
func (ctrl *ReportController) IPDReport(c *gin.Context) {
	period := c.DefaultQuery("period", "month")
	from, to := periodRange(period)

	var totalAdmissions, dischargedCount int64
	ctrl.DB.Model(&models.Admission{}).
		Where("created_at BETWEEN ? AND ?", from, to).Count(&totalAdmissions)
	ctrl.DB.Model(&models.Admission{}).
		Where("discharge_date IS NOT NULL AND discharge_date != '' AND created_at BETWEEN ? AND ?", from, to).
		Count(&dischargedCount)

	// Average length of stay (days) for discharged patients
	type LOS struct {
		AvgDays float64 `json:"avg_days"`
	}
	var losResult LOS
	ctrl.DB.Raw(`
		SELECT AVG(
			EXTRACT(EPOCH FROM (discharge_date::timestamp - admission_date::timestamp)) / 86400
		) AS avg_days
		FROM hc_admissions
		WHERE discharge_date IS NOT NULL AND discharge_date != ''
		AND created_at BETWEEN ? AND ?
		AND deleted_at IS NULL
	`, from, to).Scan(&losResult)

	// Bed occupancy
	var totalBeds, occupiedBeds int64
	ctrl.DB.Model(&models.Bed{}).Count(&totalBeds)
	ctrl.DB.Model(&models.Bed{}).Where("status = 'Occupied'").Count(&occupiedBeds)

	occupancyRate := float64(0)
	if totalBeds > 0 {
		occupancyRate = float64(occupiedBeds) / float64(totalBeds) * 100
	}

	// Surgeries in period
	var scheduledSurgeries, completedSurgeries int64
	ctrl.DB.Model(&models.Surgery{}).
		Where("created_at BETWEEN ? AND ?", from, to).Count(&scheduledSurgeries)
	ctrl.DB.Model(&models.Surgery{}).
		Where("status = 'Completed' AND created_at BETWEEN ? AND ?", from, to).Count(&completedSurgeries)

	// Transfers / Discharges
	type TransferStat struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}
	var transferStats []TransferStat
	ctrl.DB.Raw(`
		SELECT type, COUNT(*) AS count
		FROM hc_transfers
		WHERE created_at BETWEEN ? AND ?
		AND deleted_at IS NULL
		GROUP BY type
	`, from, to).Scan(&transferStats)

	c.JSON(http.StatusOK, gin.H{
		"period":               period,
		"range":                gin.H{"from": from, "to": to},
		"total_admissions":     totalAdmissions,
		"discharged":           dischargedCount,
		"avg_length_of_stay":   losResult.AvgDays,
		"bed_occupancy_rate":   occupancyRate,
		"beds":                 gin.H{"total": totalBeds, "occupied": occupiedBeds},
		"surgeries":            gin.H{"scheduled": scheduledSurgeries, "completed": completedSurgeries},
		"transfers":            transferStats,
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/reports/pharmacy
// ─────────────────────────────────────────────────────────────────────────────

// PharmacyReport handles GET /api/v1/reports/pharmacy
func (ctrl *ReportController) PharmacyReport(c *gin.Context) {
	period := c.DefaultQuery("period", "month")
	from, to := periodRange(period)

	// Dispense stats
	type DispenseStat struct {
		TotalDispenses int64   `json:"total_dispenses"`
		TotalRevenue   float64 `json:"total_revenue"`
	}
	var dispenseStat DispenseStat
	ctrl.DB.Raw(`
		SELECT COUNT(*) AS total_dispenses,
		       COALESCE(SUM(quantity * unit_price), 0) AS total_revenue
		FROM hc_pharmacy_dispenses
		WHERE created_at BETWEEN ? AND ?
		AND deleted_at IS NULL
	`, from, to).Scan(&dispenseStat)

	// Top dispensed items
	type TopItem struct {
		ItemName    string `json:"item_name"`
		TotalQty    int64  `json:"total_qty"`
		TotalAmount float64 `json:"total_amount"`
	}
	var topItems []TopItem
	ctrl.DB.Raw(`
		SELECT i.item_name, SUM(d.quantity) AS total_qty,
		       SUM(d.quantity * d.unit_price) AS total_amount
		FROM hc_pharmacy_dispenses d
		JOIN hc_inventories i ON i.id = d.inventory_id
		WHERE d.created_at BETWEEN ? AND ?
		AND d.deleted_at IS NULL
		GROUP BY i.item_name
		ORDER BY total_qty DESC
		LIMIT 10
	`, from, to).Scan(&topItems)

	// Pending prescriptions
	var pendingPrescriptions int64
	ctrl.DB.Model(&models.Prescription{}).
		Where("id NOT IN (SELECT DISTINCT prescription_id FROM hc_pharmacy_dispenses)").
		Count(&pendingPrescriptions)

	// Stock summary
	var totalStockItems, lowStockItems, expiringSoon int64
	ctrl.DB.Model(&models.Inventory{}).Count(&totalStockItems)
	ctrl.DB.Model(&models.Inventory{}).Where("stock_quantity < 10").Count(&lowStockItems)
	ctrl.DB.Model(&models.Inventory{}).
		Where("expiry_date IS NOT NULL AND expiry_date != '' AND expiry_date::date <= CURRENT_DATE + interval '30 days' AND expiry_date::date >= CURRENT_DATE").
		Count(&expiringSoon)

	c.JSON(http.StatusOK, gin.H{
		"period":               period,
		"range":                gin.H{"from": from, "to": to},
		"dispenses":            dispenseStat,
		"top_items":            topItems,
		"pending_prescriptions": pendingPrescriptions,
		"stock": gin.H{
			"total":         totalStockItems,
			"low_stock":     lowStockItems,
			"expiring_soon": expiringSoon,
		},
	})
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// periodRange converts a named period to a (from, to) timestamp string pair.
func periodRange(period string) (string, string) {
	now := time.Now()
	layout := "2006-01-02 15:04:05"

	switch period {
	case "today":
		start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		end := start.Add(24*time.Hour - time.Second)
		return start.Format(layout), end.Format(layout)
	case "week":
		// Sunday-based week start
		weekday := int(now.Weekday())
		start := now.AddDate(0, 0, -weekday)
		start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, now.Location())
		end := start.AddDate(0, 0, 7).Add(-time.Second)
		return start.Format(layout), end.Format(layout)
	case "month":
		start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end := start.AddDate(0, 1, 0).Add(-time.Second)
		return start.Format(layout), end.Format(layout)
	case "year":
		start := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
		end := start.AddDate(1, 0, 0).Add(-time.Second)
		return start.Format(layout), end.Format(layout)
	default:
		// Default to current month
		start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end := start.AddDate(0, 1, 0).Add(-time.Second)
		return start.Format(layout), end.Format(layout)
	}
}
