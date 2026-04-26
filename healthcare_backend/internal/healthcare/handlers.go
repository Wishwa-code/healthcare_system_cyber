package healthcare

import (
	"garment-management-backend/internal/database"
	"garment-management-backend/internal/healthcare/controllers"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up all healthcare module routes under /api/v1/healthcare
// AND the frontend-facing patient routes under /api/v1/patients.
func RegisterRoutes(rg *gin.RouterGroup) {
	patientCtrl := &controllers.PatientController{DB: database.DB}
	ehrCtrl := &controllers.EHRController{DB: database.DB}
	doctorCtrl := &controllers.DoctorController{DB: database.DB}
	appointmentCtrl := &controllers.AppointmentController{DB: database.DB}
	admissionCtrl := &controllers.AdmissionController{DB: database.DB}
	opdCtrl := &controllers.OPDController{DB: database.DB}
	prescriptionCtrl := &controllers.PrescriptionController{DB: database.DB}
	inventoryCtrl := &controllers.InventoryController{DB: database.DB}
	supplierCtrl := &controllers.HCSupplierController{DB: database.DB}

	v1 := rg.Group("/v1")
	{
		// ══════════════════════════════════════════════════════════════════════
		// Frontend Patient Management routes — /api/v1/patients/...
		// These are the canonical URLs consumed by the React frontend.
		// ══════════════════════════════════════════════════════════════════════
		patients := v1.Group("/patients")
		{
			// GET  /api/v1/patients           — list (search, gender, blood_group, page, per_page)
			patients.GET("", patientCtrl.Index)
			// POST /api/v1/patients           — create patient
			patients.POST("", patientCtrl.Store)
			// GET  /api/v1/patients/generate-id
			patients.GET("/generate-id", patientCtrl.GenerateID)

			// ── Single patient ──────────────────────────────────────────────
			// GET    /api/v1/patients/:id     — get patient + EHR snapshot
			patients.GET("/:id", patientCtrl.Get)
			// PUT    /api/v1/patients/:id     — update demographics
			patients.PUT("/:id", patientCtrl.Update)
			// DELETE /api/v1/patients/:id     — soft-delete
			patients.DELETE("/:id", patientCtrl.Destroy)

			// ── EHR / EMR records ───────────────────────────────────────────
			// GET /api/v1/patients/:id/ehr    — full EHR record
			patients.GET("/:id/ehr", ehrCtrl.Get)
			// PUT /api/v1/patients/:id/ehr    — create or update full EHR
			patients.PUT("/:id/ehr", ehrCtrl.Upsert)
			// POST kept for backward compatibility with old frontend code
			patients.POST("/:id/ehr", ehrCtrl.Upsert)

			// ── Medical History sub-resource ────────────────────────────────
			// GET /api/v1/patients/:id/history
			patients.GET("/:id/history", ehrCtrl.GetHistory)

			// ── Allergies & Immunizations sub-resource ──────────────────────
			// GET /api/v1/patients/:id/allergies
			patients.GET("/:id/allergies", ehrCtrl.GetAllergies)
			// PUT /api/v1/patients/:id/allergies
			patients.PUT("/:id/allergies", ehrCtrl.UpsertAllergies)
		}

		// ══════════════════════════════════════════════════════════════════════
		// Legacy /api/v1/healthcare/... routes (kept for backward compat)
		// ══════════════════════════════════════════════════════════════════════
		hc := v1.Group("/healthcare")
		{
			// ── Patient Management ─────────────────────────────────────────
			hcPatients := hc.Group("/patients")
			{
				hcPatients.GET("", patientCtrl.Index)
				hcPatients.POST("", patientCtrl.Store)
				hcPatients.GET("/generate-id", patientCtrl.GenerateID)
				hcPatients.GET("/:id", patientCtrl.Get)
				hcPatients.PUT("/:id", patientCtrl.Update)
				hcPatients.DELETE("/:id", patientCtrl.Destroy)
				hcPatients.GET("/:id/ehr", ehrCtrl.Get)
				hcPatients.PUT("/:id/ehr", ehrCtrl.Upsert)
				hcPatients.POST("/:id/ehr", ehrCtrl.Upsert)
				hcPatients.GET("/:id/history", ehrCtrl.GetHistory)
				hcPatients.GET("/:id/allergies", ehrCtrl.GetAllergies)
				hcPatients.PUT("/:id/allergies", ehrCtrl.UpsertAllergies)
			}

			// ── Doctor Management ──────────────────────────────────────────
			doctors := hc.Group("/doctors")
			{
				doctors.GET("", doctorCtrl.Index)
				doctors.POST("", doctorCtrl.Store)
				doctors.GET("/:id", doctorCtrl.Get)
				doctors.PUT("/:id", doctorCtrl.Update)
				doctors.DELETE("/:id", doctorCtrl.Destroy)
				doctors.GET("/:id/availability", doctorCtrl.GetAvailability)
				doctors.POST("/:id/availability", doctorCtrl.AddAvailability)
			}

			// ── Appointments & Queue ───────────────────────────────────────
			appointments := hc.Group("/appointments")
			{
				appointments.GET("", appointmentCtrl.Index)
				appointments.POST("", appointmentCtrl.Store)
				appointments.GET("/:id", appointmentCtrl.Get)
				appointments.DELETE("/:id", appointmentCtrl.Destroy)
				appointments.POST("/:id/status", appointmentCtrl.UpdateStatus)
				appointments.POST("/:id/queue", appointmentCtrl.AddQueueEntry)
			}

			// ── OPD Consultations ──────────────────────────────────────────
			opd := hc.Group("/opd-consultations")
			{
				opd.GET("", opdCtrl.Index)
				opd.POST("", opdCtrl.Store)
				opd.GET("/:id", opdCtrl.Get)
			}

			// ── Admissions & IPD ───────────────────────────────────────────
			admissions := hc.Group("/admissions")
			{
				admissions.GET("", admissionCtrl.Index)
				admissions.POST("", admissionCtrl.Store)
				admissions.GET("/:id", admissionCtrl.Get)
				admissions.POST("/:id/discharge", admissionCtrl.Discharge)
				admissions.POST("/:id/ward", admissionCtrl.AllocateWard)
			}

			// ── Prescriptions ──────────────────────────────────────────────
			prescriptions := hc.Group("/prescriptions")
			{
				prescriptions.GET("", prescriptionCtrl.Index)
				prescriptions.POST("", prescriptionCtrl.Store)
				prescriptions.GET("/:id", prescriptionCtrl.Get)
			}

			// ── Pharmacy / Inventory ───────────────────────────────────────
			inventory := hc.Group("/inventory")
			{
				inventory.GET("", inventoryCtrl.Index)
				inventory.POST("", inventoryCtrl.Store)
				inventory.PUT("/:id", inventoryCtrl.Update)
				inventory.DELETE("/:id", inventoryCtrl.Destroy)
				inventory.POST("/:id/dispense", inventoryCtrl.Dispense)
				inventory.POST("/:id/stock-in", inventoryCtrl.StockIn)
			}

			// ── Suppliers ──────────────────────────────────────────────────
			suppliers := hc.Group("/suppliers")
			{
				suppliers.GET("", supplierCtrl.Index)
				suppliers.POST("", supplierCtrl.Store)
				suppliers.PUT("/:id", supplierCtrl.Update)
				suppliers.DELETE("/:id", supplierCtrl.Destroy)
			}
		}
	}
}
