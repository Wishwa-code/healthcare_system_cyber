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
		// Healthcare Module 🏥
		&healthcareModels.Patient{},
		&healthcareModels.EHRRecord{},
		&healthcareModels.Doctor{},
		&healthcareModels.DoctorAvailability{},
		&healthcareModels.Appointment{},
		&healthcareModels.QueueEntry{},
		&healthcareModels.OPDConsultation{},
		&healthcareModels.Admission{},
		&healthcareModels.WardAllocation{},
		&healthcareModels.Prescription{},
		&healthcareModels.Inventory{},
		&healthcareModels.PharmacyDispense{},
		&healthcareModels.HCSupplier{},
		&healthcareModels.InventoryStockIn{},
	)
	if err != nil {
		log.Fatalf("❌ Migration failed: %v", err)
	}

	fmt.Println("✅ Fresh migration completed successfully!")
}
