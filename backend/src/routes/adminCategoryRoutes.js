import express from 'express';
import {
    getAllCategoriesAdmin,
    getCategoryByIdAdmin,
    createCategoryAdmin,
    updateCategoryAdmin,
    deleteCategoryAdmin
} from '../controllers/adminCategoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import pkg from '@prisma/client'; // Import Role enum
const { Role } = pkg;

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(protect, authorize(Role.ADMIN));

// Routes for /api/v1/admin/categories
router.route('/')
    .get(getAllCategoriesAdmin)
    .post(createCategoryAdmin);

// Routes for /api/v1/admin/categories/:id
router.route('/:id')
    .get(getCategoryByIdAdmin)
    .put(updateCategoryAdmin)
    .delete(deleteCategoryAdmin);

export default router;