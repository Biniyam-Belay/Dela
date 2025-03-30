import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderToPaid // Placeholder
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import pkg from '@prisma/client'; // Import Role enum
const { Role } = pkg;

const router = express.Router();

// Place a new order (must be logged in)
router.post('/', protect, createOrder);

// Get logged-in user's orders
router.get('/myorders', protect, getMyOrders);

// Get a specific order by ID (must be logged in user or admin)
router.get('/:id', protect, getOrderById);

// Placeholder for updating payment status (likely protected for Admin/Webhook)
router.put('/:id/pay', protect, authorize(Role.ADMIN), updateOrderToPaid); // Example: Admin can mark as paid


// Add routes for admin to get all orders later
// router.get('/', protect, authorize(Role.ADMIN), getAllOrders);

export default router;