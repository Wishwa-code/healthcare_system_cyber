package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	healthcareModels "garment-management-backend/internal/healthcare/models"
	"garment-management-backend/internal/models"
)

func main() {
	dsn := "postgresql://neondb_owner:npg_MjkEKWnt02dO@ep-crimson-thunder-anmfhm98-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: false,
	})
	if err != nil {
		log.Fatalf("❌ Failed to connect: %v", err)
	}

	fmt.Println("⚠️  Dropping all tables...")

	// Drop all tables in reverse dependency order
	err = db.Migrator().DropTable(
		// New tables (reverse dep order)
		&healthcareModels.Transfer{},
		&healthcareModels.NursingNote{},
		&healthcareModels.Surgery{},
		&healthcareModels.SurgicalSupply{},
		&healthcareModels.VitalSign{},
		&healthcareModels.Bed{},
		// Existing tables
		&healthcareModels.InventoryStockIn{},
		&healthcareModels.HCSupplier{},
		&healthcareModels.PharmacyDispense{},
		&healthcareModels.Inventory{},
		&healthcareModels.Prescription{},
		&healthcareModels.WardAllocation{},
		&healthcareModels.Admission{},
		&healthcareModels.OPDConsultation{},
		&healthcareModels.QueueEntry{},
		&healthcareModels.Appointment{},
		&healthcareModels.DoctorAvailability{},
		&healthcareModels.Doctor{},
		&healthcareModels.EHRRecord{},
		&healthcareModels.Patient{},
		&models.User{},
	)
	if err != nil {
		log.Fatalf("❌ Drop failed: %v", err)
	}
	fmt.Println("✅ All tables dropped.")

	fmt.Println("🚀 Running fresh AutoMigrate...")
	err = db.AutoMigrate(
		&models.User{},
		// Healthcare Core 🏥
		&healthcareModels.Patient{},
		&healthcareModels.EHRRecord{},
		&healthcareModels.Doctor{},
		&healthcareModels.DoctorAvailability{},
		// Appointments & Queue
		&healthcareModels.Appointment{},
		&healthcareModels.QueueEntry{},
		// OPD
		&healthcareModels.OPDConsultation{},
		&healthcareModels.VitalSign{},
		// IPD
		&healthcareModels.Admission{},
		&healthcareModels.WardAllocation{},
		&healthcareModels.Bed{},
		&healthcareModels.Surgery{},
		&healthcareModels.NursingNote{},
		&healthcareModels.Transfer{},
		// Pharmacy & Inventory
		&healthcareModels.Prescription{},
		&healthcareModels.Inventory{},
		&healthcareModels.PharmacyDispense{},
		&healthcareModels.HCSupplier{},
		&healthcareModels.InventoryStockIn{},
		&healthcareModels.SurgicalSupply{},
	)
	if err != nil {
		log.Fatalf("❌ Migration failed: %v", err)
	}

	fmt.Println("✅ Fresh migration completed successfully!")
}
