import express from 'express';
import {
    getAllProductsAdmin,
    getProductByIdAdmin,
    createProductAdmin,
    updateProductAdmin,
    deleteProductAdmin
} from '../controllers/adminProductController.js'; // Controller for admin product actions
import { protect, authorize } from '../middleware/authMiddleware.js'; // Auth middleware
import { uploadProductImages } from '../middleware/uploadMiddleware.js'; // Image upload middleware
import { Role } from '@prisma/client'; // Role enum for authorization

const router = express.Router();

// Apply authentication and ADMIN role authorization to ALL routes in this file
router.use(protect, authorize(Role.ADMIN));

// Routes for /api/v1/admin/products

// GET all products (admin view)
// POST a new product (handles image uploads via middleware)
router.route('/')
    .get(getAllProductsAdmin)
    .post(uploadProductImages, createProductAdmin); // Apply upload middleware BEFORE the controller

// Routes for /api/v1/admin/products/:id

// GET a single product by ID (for editing form)
// PUT (update) a product by ID (handles image uploads via middleware)
// DELETE a product by ID
router.route('/:id')
    .get(getProductByIdAdmin)
    .put(uploadProductImages, updateProductAdmin) // Apply upload middleware BEFORE the controller
    .delete(deleteProductAdmin);

export default router;