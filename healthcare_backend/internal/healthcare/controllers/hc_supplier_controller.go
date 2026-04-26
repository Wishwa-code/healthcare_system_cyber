package controllers

import (
	"garment-management-backend/internal/healthcare/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HCSupplierController struct {
	DB *gorm.DB
}

// Index handles GET /api/v1/healthcare/suppliers
func (ctrl *HCSupplierController) Index(c *gin.Context) {
	var suppliers []models.HCSupplier
	if err := ctrl.DB.Find(&suppliers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch suppliers"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": suppliers})
}

// Store handles POST /api/v1/healthcare/suppliers
func (ctrl *HCSupplierController) Store(c *gin.Context) {
	var req struct {
		Name      string `json:"name" binding:"required"`
		ContactNo string `json:"contact_no"`
		Email     string `json:"email"`
		Address   string `json:"address"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	supplier := models.HCSupplier{
		Name:      req.Name,
		ContactNo: req.ContactNo,
		Email:     req.Email,
		Address:   req.Address,
	}
	if err := ctrl.DB.Create(&supplier).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create supplier"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Supplier created", "data": supplier})
}

// Update handles PUT /api/v1/healthcare/suppliers/:id
func (ctrl *HCSupplierController) Update(c *gin.Context) {
	id := c.Param("id")
	var supplier models.HCSupplier
	if err := ctrl.DB.First(&supplier, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Supplier not found"})
		return
	}

	var req struct {
		Name      string `json:"name"`
		ContactNo string `json:"contact_no"`
		Email     string `json:"email"`
		Address   string `json:"address"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	supplier.Name = req.Name
	supplier.ContactNo = req.ContactNo
	supplier.Email = req.Email
	supplier.Address = req.Address

	if err := ctrl.DB.Save(&supplier).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update supplier"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Supplier updated", "data": supplier})
}

// Destroy handles DELETE /api/v1/healthcare/suppliers/:id
func (ctrl *HCSupplierController) Destroy(c *gin.Context) {
	id := c.Param("id")
	if err := ctrl.DB.Delete(&models.HCSupplier{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete supplier"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Supplier deleted"})
}
