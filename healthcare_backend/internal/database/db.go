package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	healthcareModels "garment-management-backend/internal/healthcare/models"
	"garment-management-backend/internal/models"
	_ "github.com/lib/pq"
)

// DB is now a GORM instance 🔗
var DB *gorm.DB

func Connect() {
	// Your Neon PostgreSQL connection string
	dsn := "postgresql://neondb_owner:npg_MjkEKWnt02dO@ep-crimson-thunder-anmfhm98-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

	var err error
	// Open connection using GORM 🚀	
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt: false,
		// Add GORM config here if needed (e.g., Logger)
	})

	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	err = DB.AutoMigrate(
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
		log.Fatalf("❌ Migration Failed: %v", err)
	}

	// Optional: Configure Connection Pool 🏊‍♂️
	sqlDB, err := DB.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(100)
	}

	fmt.Println("✅ GORM connected to PostgreSQL successfully")
}
