package healthcare

import (
	"garment-management-backend/internal/database"
	"garment-management-backend/internal/healthcare/controllers"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up all healthcare module routes under /api/v1/healthcare
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
		hc := v1.Group("/healthcare")
		{
			// ── Patient Management ─────────────────────────────────────────
			patients := hc.Group("/patients")
			{
				patients.GET("", patientCtrl.Index)                   // GET  /api/v1/healthcare/patients
				patients.POST("", patientCtrl.Store)                  // POST /api/v1/healthcare/patients
				patients.GET("/generate-id", patientCtrl.GenerateID)  // GET  /api/v1/healthcare/patients/generate-id
				patients.GET("/:id", patientCtrl.Get)                 // GET  /api/v1/healthcare/patients/:id
				patients.PUT("/:id", patientCtrl.Update)              // PUT  /api/v1/healthcare/patients/:id
				patients.DELETE("/:id", patientCtrl.Destroy)          // DELETE /api/v1/healthcare/patients/:id
				patients.GET("/:id/ehr", ehrCtrl.Get)                 // GET  /api/v1/healthcare/patients/:id/ehr
				patients.POST("/:id/ehr", ehrCtrl.Upsert)             // POST /api/v1/healthcare/patients/:id/ehr
			}

			// ── Doctor Management ──────────────────────────────────────────
			doctors := hc.Group("/doctors")
			{
				doctors.GET("", doctorCtrl.Index)                            // GET  /api/v1/healthcare/doctors
				doctors.POST("", doctorCtrl.Store)                           // POST /api/v1/healthcare/doctors
				doctors.GET("/:id", doctorCtrl.Get)                          // GET  /api/v1/healthcare/doctors/:id
				doctors.PUT("/:id", doctorCtrl.Update)                       // PUT  /api/v1/healthcare/doctors/:id
				doctors.DELETE("/:id", doctorCtrl.Destroy)                   // DELETE /api/v1/healthcare/doctors/:id
				doctors.GET("/:id/availability", doctorCtrl.GetAvailability) // GET  /api/v1/healthcare/doctors/:id/availability
				doctors.POST("/:id/availability", doctorCtrl.AddAvailability) // POST /api/v1/healthcare/doctors/:id/availability
			}

			// ── Appointments & Queue ───────────────────────────────────────
			appointments := hc.Group("/appointments")
			{
				appointments.GET("", appointmentCtrl.Index)                    // GET  /api/v1/healthcare/appointments
				appointments.POST("", appointmentCtrl.Store)                   // POST /api/v1/healthcare/appointments
				appointments.GET("/:id", appointmentCtrl.Get)                  // GET  /api/v1/healthcare/appointments/:id
				appointments.DELETE("/:id", appointmentCtrl.Destroy)           // DELETE /api/v1/healthcare/appointments/:id
				appointments.POST("/:id/status", appointmentCtrl.UpdateStatus) // POST /api/v1/healthcare/appointments/:id/status
				appointments.POST("/:id/queue", appointmentCtrl.AddQueueEntry) // POST /api/v1/healthcare/appointments/:id/queue
			}

			// ── OPD Consultations ──────────────────────────────────────────
			opd := hc.Group("/opd-consultations")
			{
				opd.GET("", opdCtrl.Index)      // GET  /api/v1/healthcare/opd-consultations
				opd.POST("", opdCtrl.Store)     // POST /api/v1/healthcare/opd-consultations
				opd.GET("/:id", opdCtrl.Get)    // GET  /api/v1/healthcare/opd-consultations/:id
			}

			// ── Admissions & IPD ───────────────────────────────────────────
			admissions := hc.Group("/admissions")
			{
				admissions.GET("", admissionCtrl.Index)                     // GET  /api/v1/healthcare/admissions
				admissions.POST("", admissionCtrl.Store)                    // POST /api/v1/healthcare/admissions
				admissions.GET("/:id", admissionCtrl.Get)                   // GET  /api/v1/healthcare/admissions/:id
				admissions.POST("/:id/discharge", admissionCtrl.Discharge)  // POST /api/v1/healthcare/admissions/:id/discharge
				admissions.POST("/:id/ward", admissionCtrl.AllocateWard)    // POST /api/v1/healthcare/admissions/:id/ward
			}

			// ── Prescriptions ──────────────────────────────────────────────
			prescriptions := hc.Group("/prescriptions")
			{
				prescriptions.GET("", prescriptionCtrl.Index)      // GET  /api/v1/healthcare/prescriptions
				prescriptions.POST("", prescriptionCtrl.Store)     // POST /api/v1/healthcare/prescriptions
				prescriptions.GET("/:id", prescriptionCtrl.Get)    // GET  /api/v1/healthcare/prescriptions/:id
			}

			// ── Pharmacy / Inventory ───────────────────────────────────────
			inventory := hc.Group("/inventory")
			{
				inventory.GET("", inventoryCtrl.Index)                       // GET  /api/v1/healthcare/inventory
				inventory.POST("", inventoryCtrl.Store)                      // POST /api/v1/healthcare/inventory
				inventory.PUT("/:id", inventoryCtrl.Update)                  // PUT  /api/v1/healthcare/inventory/:id
				inventory.DELETE("/:id", inventoryCtrl.Destroy)              // DELETE /api/v1/healthcare/inventory/:id
				inventory.POST("/:id/dispense", inventoryCtrl.Dispense)      // POST /api/v1/healthcare/inventory/:id/dispense
				inventory.POST("/:id/stock-in", inventoryCtrl.StockIn)       // POST /api/v1/healthcare/inventory/:id/stock-in
			}

			// ── Suppliers ──────────────────────────────────────────────────
			suppliers := hc.Group("/suppliers")
			{
				suppliers.GET("", supplierCtrl.Index)          // GET  /api/v1/healthcare/suppliers
				suppliers.POST("", supplierCtrl.Store)         // POST /api/v1/healthcare/suppliers
				suppliers.PUT("/:id", supplierCtrl.Update)     // PUT  /api/v1/healthcare/suppliers/:id
				suppliers.DELETE("/:id", supplierCtrl.Destroy) // DELETE /api/v1/healthcare/suppliers/:id
			}
		}
	}
}
