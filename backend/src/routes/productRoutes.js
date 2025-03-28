import express from 'express';
import { getAllProducts, getProductByIdentifier, createProduct } from '../controllers/productController.js';
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllProducts)
  // .post(protect, admin, createProduct); // Add protection later
  .post(createProduct); // TEMPORARY: Allow creating without auth

router.route('/:identifier') // Use :identifier to accept slug or ID
    .get(getProductByIdentifier);

// Add PUT and DELETE for /:id later

export default router;