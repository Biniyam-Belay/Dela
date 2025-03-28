import express from 'express';
import { getAllProducts, getProductByIdentifier, createProduct } from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js'; // Import middleware
import { Role } from '@prisma/client'; // Import Role enum from generated client

const router = express.Router();

router.route('/')
  .get(getAllProducts)
  .post(protect, authorize(Role.ADMIN), createProduct); // Protect and authorize ADMIN

router.route('/:identifier')
    .get(getProductByIdentifier);
 // Add PUT/DELETE with protection later

export default router;