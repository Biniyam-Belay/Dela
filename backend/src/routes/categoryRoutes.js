import express from 'express';
import { getAllCategories, createCategory } from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // Import middleware
import { Role } from '@prisma/client'; // Import Role enum

const router = express.Router();

router.route('/')
  .get(getAllCategories)
  .post(protect, authorize(Role.ADMIN), createCategory); // Protect and authorize ADMIN

// Add routes for /:id (get single, update, delete) later

export default router;