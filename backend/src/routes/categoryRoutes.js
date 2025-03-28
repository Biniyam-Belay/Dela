import express from 'express';
import { getAllCategories, createCategory } from '../controllers/categoryController.js';
// Import protection middleware later for admin routes
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllCategories)
  // .post(protect, admin, createCategory); // Add protection later
  .post(createCategory); // TEMPORARY: Allow creating without auth for now

// Add routes for /:id (get single, update, delete) later

export default router;