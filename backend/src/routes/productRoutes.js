// backend/src/routes/productRoutes.js
import express from 'express';
// Remove createProduct import if no longer needed here
import { getAllProducts, getProductByIdentifier } from '../controllers/productController.js';
// No need for protect/authorize here unless specific public routes need it

const router = express.Router();

router.route('/')
  .get(getAllProducts);
  // REMOVED .post(createProduct); - Handled by admin routes now

router.route('/:identifier')
    .get(getProductByIdentifier);

export default router;