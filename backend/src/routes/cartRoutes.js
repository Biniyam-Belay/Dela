import express from 'express';
import { getCart, addToCart, addToCartValidationRules } from '../controllers/cartController.js';
import { handleValidationErrors } from '../middleware/validationHandler.js'; // Assuming you moved the helper
import { isAuthenticated } from '../middleware/authMiddleware.js'; // Your auth middleware

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(isAuthenticated);

// GET /api/cart
router.get('/', getCart);

// POST /api/cart/items
router.post(
    '/items',
    addToCartValidationRules, // Apply validation rules
    handleValidationErrors,    // Handle potential validation errors
    addToCart                  // Proceed to controller if validation passes
);

// (Add routes for updating quantity, removing items etc. following similar patterns)

export default router;