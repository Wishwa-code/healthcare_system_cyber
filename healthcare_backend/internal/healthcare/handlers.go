package healthcare

import (
	"garment-management-backend/internal/database"
	"garment-management-backend/internal/healthcare/controllers"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up all healthcare module routes.
//
// Primary API surface (frontend-facing):
//   /api/v1/patients/...
//   /api/v1/doctors/...
//   /api/v1/appointments/...
//   /api/v1/opd/...
//   /api/v1/ipd/...
//   /api/v1/pharmacy/...
//   /api/v1/reports/...
//
// Legacy surface (kept for backward compatibility):
//   /api/v1/healthcare/...
func RegisterRoutes(rg *gin.RouterGroup) {
	// ── Instantiate controllers ──────────────────────────────────────────────
	patientCtrl := &controllers.PatientController{DB: database.DB}
	ehrCtrl := &controllers.EHRController{DB: database.DB}
	doctorCtrl := &controllers.DoctorController{DB: database.DB}
	appointmentCtrl := &controllers.AppointmentController{DB: database.DB}
	queueCtrl := &controllers.QueueController{DB: database.DB}
	admissionCtrl := &controllers.AdmissionController{DB: database.DB}
	opdCtrl := &controllers.OPDController{DB: database.DB}
	prescriptionCtrl := &controllers.PrescriptionController{DB: database.DB}
	inventoryCtrl := &controllers.InventoryController{DB: database.DB}
	supplierCtrl := &controllers.HCSupplierController{DB: database.DB}
	vitalCtrl := &controllers.VitalController{DB: database.DB}
	bedCtrl := &controllers.BedController{DB: database.DB}
	surgeryCtrl := &controllers.SurgeryController{DB: database.DB}
	nursingNoteCtrl := &controllers.NursingNoteController{DB: database.DB}
	transferCtrl := &controllers.TransferController{DB: database.DB}
	pharmacyCtrl := &controllers.PharmacyController{DB: database.DB}
	reportCtrl := &controllers.ReportController{DB: database.DB}

	v1 := rg.Group("/v1")
	{
		// ══════════════════════════════════════════════════════════════════════
		// PATIENTS  /api/v1/patients/...
		// ══════════════════════════════════════════════════════════════════════
		patients := v1.Group("/patients")
		{
			patients.GET("", patientCtrl.Index)
			patients.POST("", patientCtrl.Store)
			patients.GET("/generate-id", patientCtrl.GenerateID)
			patients.GET("/:id", patientCtrl.Get)
			patients.PUT("/:id", patientCtrl.Update)
			patients.DELETE("/:id", patientCtrl.Destroy)
			patients.GET("/:id/ehr", ehrCtrl.Get)
			patients.PUT("/:id/ehr", ehrCtrl.Upsert)
			patients.POST("/:id/ehr", ehrCtrl.Upsert)
			patients.GET("/:id/history", ehrCtrl.GetHistory)
			patients.GET("/:id/allergies", ehrCtrl.GetAllergies)
			patients.PUT("/:id/allergies", ehrCtrl.UpsertAllergies)
		}

		// ══════════════════════════════════════════════════════════════════════
		// DOCTORS  /api/v1/doctors/...
		// ══════════════════════════════════════════════════════════════════════
		doctors := v1.Group("/doctors")
		{
			// GET  /api/v1/doctors              — list for dropdown / search
			doctors.GET("", doctorCtrl.Index)
			doctors.POST("", doctorCtrl.Store)
			doctors.GET("/:id", doctorCtrl.Get)
			doctors.PUT("/:id", doctorCtrl.Update)
			doctors.DELETE("/:id", doctorCtrl.Destroy)
			// GET  /api/v1/doctors/:id/availability?date=YYYY-MM-DD
			doctors.GET("/:id/availability", doctorCtrl.GetAvailability)
			doctors.POST("/:id/availability", doctorCtrl.AddAvailability)
		}

		// ══════════════════════════════════════════════════════════════════════
		// APPOINTMENTS  /api/v1/appointments/...
		// ══════════════════════════════════════════════════════════════════════
		appointments := v1.Group("/appointments")
		{
			// GET  /api/v1/appointments?date=&doctor_id=&status=
			appointments.GET("", appointmentCtrl.Index)
			// POST /api/v1/appointments
			appointments.POST("", appointmentCtrl.Store)
			// PUT  /api/v1/appointments/:id
			appointments.PUT("/:id", appointmentCtrl.Update)
			// DELETE /api/v1/appointments/:id
			appointments.DELETE("/:id", appointmentCtrl.Destroy)

			// Queue sub-routes
			// GET  /api/v1/appointments/queue
			appointments.GET("/queue", queueCtrl.GetQueue)
			// PUT  /api/v1/appointments/queue/:id/status
			appointments.PUT("/queue/:id/status", queueCtrl.UpdateQueueStatus)
		}

		// ══════════════════════════════════════════════════════════════════════
		// OPD  /api/v1/opd/...
		// ══════════════════════════════════════════════════════════════════════
		opd := v1.Group("/opd")
		{
			// GET  /api/v1/opd/consultations
			// POST /api/v1/opd/consultations
			opd.GET("/consultations", opdCtrl.Index)
			opd.POST("/consultations", opdCtrl.Store)
			opd.GET("/consultations/:id", opdCtrl.Get)

			// GET  /api/v1/opd/vitals?patient_id=
			// POST /api/v1/opd/vitals
			opd.GET("/vitals", vitalCtrl.Index)
			opd.POST("/vitals", vitalCtrl.Store)

			// GET  /api/v1/opd/prescriptions?patient_id=&consultation_id=
			// POST /api/v1/opd/prescriptions
			// PUT  /api/v1/opd/prescriptions/:id
			opd.GET("/prescriptions", prescriptionCtrl.Index)
			opd.POST("/prescriptions", prescriptionCtrl.Store)
			opd.PUT("/prescriptions/:id", prescriptionCtrl.Update)
		}

		// ══════════════════════════════════════════════════════════════════════
		// IPD  /api/v1/ipd/...
		// ══════════════════════════════════════════════════════════════════════
		ipd := v1.Group("/ipd")
		{
			// GET  /api/v1/ipd/admissions
			// POST /api/v1/ipd/admissions
			// PUT  /api/v1/ipd/admissions/:id
			ipd.GET("/admissions", admissionCtrl.Index)
			ipd.POST("/admissions", admissionCtrl.Store)
			ipd.PUT("/admissions/:id", admissionCtrl.Update)
			ipd.GET("/admissions/:id", admissionCtrl.Get)

			// GET  /api/v1/ipd/beds
			// PUT  /api/v1/ipd/beds/:id
			ipd.GET("/beds", bedCtrl.Index)
			ipd.POST("/beds", bedCtrl.Store)
			ipd.PUT("/beds/:id", bedCtrl.Update)

			// GET  /api/v1/ipd/surgeries
			// POST /api/v1/ipd/surgeries
			ipd.GET("/surgeries", surgeryCtrl.Index)
			ipd.POST("/surgeries", surgeryCtrl.Store)

			// GET  /api/v1/ipd/nursing-notes?patient_id=&ward_name=
			// POST /api/v1/ipd/nursing-notes
			ipd.GET("/nursing-notes", nursingNoteCtrl.Index)
			ipd.POST("/nursing-notes", nursingNoteCtrl.Store)

			// GET  /api/v1/ipd/transfers
			// POST /api/v1/ipd/transfers
			ipd.GET("/transfers", transferCtrl.Index)
			ipd.POST("/transfers", transferCtrl.Store)
		}

		// ══════════════════════════════════════════════════════════════════════
		// PHARMACY  /api/v1/pharmacy/...
		// ══════════════════════════════════════════════════════════════════════
		pharmacy := v1.Group("/pharmacy")
		{
			// GET  /api/v1/pharmacy/prescriptions?status=pending|dispensed
			pharmacy.GET("/prescriptions", pharmacyCtrl.GetPrescriptions)
			// PUT  /api/v1/pharmacy/prescriptions/:id/dispense
			pharmacy.PUT("/prescriptions/:id/dispense", pharmacyCtrl.DispensePrescription)

			// GET    /api/v1/pharmacy/stock
			// POST   /api/v1/pharmacy/stock
			// PUT    /api/v1/pharmacy/stock/:id
			// DELETE /api/v1/pharmacy/stock/:id
			pharmacy.GET("/stock", pharmacyCtrl.GetStock)
			pharmacy.POST("/stock", pharmacyCtrl.AddStock)
			pharmacy.PUT("/stock/:id", pharmacyCtrl.UpdateStock)
			pharmacy.DELETE("/stock/:id", pharmacyCtrl.DeleteStock)

			// GET /api/v1/pharmacy/expiry-alerts?days=30
			pharmacy.GET("/expiry-alerts", pharmacyCtrl.GetExpiryAlerts)

			// GET  /api/v1/pharmacy/supplies
			// POST /api/v1/pharmacy/supplies
			pharmacy.GET("/supplies", pharmacyCtrl.GetSupplies)
			pharmacy.POST("/supplies", pharmacyCtrl.AddSupply)
		}

		// ══════════════════════════════════════════════════════════════════════
		// REPORTS  /api/v1/reports/...
		// ══════════════════════════════════════════════════════════════════════
		reports := v1.Group("/reports")
		{
			// GET /api/v1/reports/overview?period=today|week|month|year
			reports.GET("/overview", reportCtrl.Overview)
			// GET /api/v1/reports/opd?period=month
			reports.GET("/opd", reportCtrl.OPDReport)
			// GET /api/v1/reports/ipd?period=month
			reports.GET("/ipd", reportCtrl.IPDReport)
			// GET /api/v1/reports/pharmacy?period=month
			reports.GET("/pharmacy", reportCtrl.PharmacyReport)
		}

		// ══════════════════════════════════════════════════════════════════════
		// LEGACY  /api/v1/healthcare/...  (kept for backward compat)
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
			hcDoctors := hc.Group("/doctors")
			{
				hcDoctors.GET("", doctorCtrl.Index)
				hcDoctors.POST("", doctorCtrl.Store)
				hcDoctors.GET("/:id", doctorCtrl.Get)
				hcDoctors.PUT("/:id", doctorCtrl.Update)
				hcDoctors.DELETE("/:id", doctorCtrl.Destroy)
				hcDoctors.GET("/:id/availability", doctorCtrl.GetAvailability)
				hcDoctors.POST("/:id/availability", doctorCtrl.AddAvailability)
			}

			// ── Appointments & Queue ───────────────────────────────────────
			hcAppts := hc.Group("/appointments")
			{
				hcAppts.GET("", appointmentCtrl.Index)
				hcAppts.POST("", appointmentCtrl.Store)
				hcAppts.GET("/:id", appointmentCtrl.Get)
				hcAppts.PUT("/:id", appointmentCtrl.Update)
				hcAppts.DELETE("/:id", appointmentCtrl.Destroy)
				hcAppts.POST("/:id/status", appointmentCtrl.UpdateStatus)
				hcAppts.POST("/:id/queue", appointmentCtrl.AddQueueEntry)
			}

			// ── OPD Consultations ──────────────────────────────────────────
			hcOPD := hc.Group("/opd-consultations")
			{
				hcOPD.GET("", opdCtrl.Index)
				hcOPD.POST("", opdCtrl.Store)
				hcOPD.GET("/:id", opdCtrl.Get)
			}

			// ── Admissions & IPD ───────────────────────────────────────────
			hcAdmissions := hc.Group("/admissions")
			{
				hcAdmissions.GET("", admissionCtrl.Index)
				hcAdmissions.POST("", admissionCtrl.Store)
				hcAdmissions.GET("/:id", admissionCtrl.Get)
				hcAdmissions.PUT("/:id", admissionCtrl.Update)
				hcAdmissions.POST("/:id/discharge", admissionCtrl.Discharge)
				hcAdmissions.POST("/:id/ward", admissionCtrl.AllocateWard)
			}

			// ── Prescriptions ──────────────────────────────────────────────
			hcPrescriptions := hc.Group("/prescriptions")
			{
				hcPrescriptions.GET("", prescriptionCtrl.Index)
				hcPrescriptions.POST("", prescriptionCtrl.Store)
				hcPrescriptions.GET("/:id", prescriptionCtrl.Get)
				hcPrescriptions.PUT("/:id", prescriptionCtrl.Update)
			}

			// ── Pharmacy / Inventory ───────────────────────────────────────
			hcInventory := hc.Group("/inventory")
			{
				hcInventory.GET("", inventoryCtrl.Index)
				hcInventory.POST("", inventoryCtrl.Store)
				hcInventory.PUT("/:id", inventoryCtrl.Update)
				hcInventory.DELETE("/:id", inventoryCtrl.Destroy)
				hcInventory.POST("/:id/dispense", inventoryCtrl.Dispense)
				hcInventory.POST("/:id/stock-in", inventoryCtrl.StockIn)
			}

			// ── Suppliers ──────────────────────────────────────────────────
			hcSuppliers := hc.Group("/suppliers")
			{
				hcSuppliers.GET("", supplierCtrl.Index)
				hcSuppliers.POST("", supplierCtrl.Store)
				hcSuppliers.PUT("/:id", supplierCtrl.Update)
				hcSuppliers.DELETE("/:id", supplierCtrl.Destroy)
			}
		}
	}
}
