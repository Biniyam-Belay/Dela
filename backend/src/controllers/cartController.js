import prisma from "../prisma/prisma.js";
import { validationResult, body } from 'express-validator';
import { Prisma } from '@prisma/client'; // Import Prisma types for specific error handling
import { v4 as uuidv4 } from 'uuid'; // Import uuid generator

// Assuming you have a logger instance (e.g., Winston, Pino)
// import logger from '../utils/logger';

// --- Helper Function for Validation Errors ---
// (Place this in a shared utility or middleware file)
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // logger.warn('Validation errors:', { errors: errors.array() });
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

// --- Get Cart Controller ---
export const getCart = async (req, res, next) => { // Added next for potential error middleware
    // 1. Authentication Check
    if (!req.user || !req.user.id) {
        // logger.warn('Unauthorized attempt to get cart');
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const userId = req.user.id;
        // logger.info(`Fetching cart for user: ${userId}`); // Example logging

        const cart = await prisma.cart.findUnique({ // Use findUnique since userId should be unique on Cart
            where: { userId: userId },
            include: {
                items: {
                    include: {
                        product: {
                            // 2. Select only necessary product fields (Optimization)
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                imageUrl: true, // Add other fields needed by the frontend cart view
                            }
                        }
                    },
                    orderBy: { // Optional: Order items consistently
                        createdAt: 'asc'
                    }
                }
            }
        });

        // 3. Consistent Response (Return empty cart structure if not found)
        if (!cart) {
            // logger.info(`No cart found for user: ${userId}, returning empty structure.`);
            return res.status(200).json({ userId: userId, items: [] }); // Return an empty cart object matching structure
        }

        // logger.info(`Successfully fetched cart for user: ${userId}`);
        res.status(200).json(cart);

    } catch (err) {
        // logger.error('Error fetching cart:', { userId: req.user?.id, error: err }); // Log the actual error
        // 4. Pass error to a centralized handler (if using one)
        next(err);
        // Or handle directly:
        // res.status(500).json({ message: 'Failed to retrieve cart. Please try again later.' });
    }
};


// --- Add to Cart Controller ---

// 1. Validation Rules Middleware (Apply this in your router)
export const addToCartValidationRules = [
    body('productId').isString().withMessage('Product ID must be a string.'), // Or isInt() if always number
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer.')
    // Add more rules if needed (e.g., maximum quantity)
];

export const addToCart = async (req, res, next) => { // Added next
    // 2. Authentication Check
    if (!req.user || !req.user.id) {
        // logger.warn('Unauthorized attempt to add to cart');
        return res.status(401).json({ message: 'Authentication required' });
    }

    // 3. Input already validated by middleware (handleValidationErrors applied in router)

    try {
        const { productId } = req.body;
        // Ensure quantity is treated as a number
        const quantity = parseInt(req.body.quantity, 10);
        const userId = req.user.id;

        // logger.info(`Attempting to add product ${productId} (qty: ${quantity}) to cart for user: ${userId}`);

        // 4. Use Prisma Transaction for Atomicity
        const updatedCart = await prisma.$transaction(async (tx) => {

            // a. Verify Product Existence (and potentially stock)
            const product = await tx.product.findUnique({
                where: { id: productId } // Assuming product ID is string CUID/UUID
                // If product ID is number: where: { id: Number(productId) }
            });

            if (!product) {
                 // logger.warn(`Product not found: ${productId}`);
                // Throw a specific error to be caught locally or roll back transaction
                throw new Error('ProductNotFound'); // Custom error identifier
            }

            // --- Optional: Stock Check ---
            // if (product.stock < quantity) {
            //    logger.warn(`Insufficient stock for product ${productId}. Requested: ${quantity}, Available: ${product.stock}`);
            //    throw new Error('InsufficientStock');
            // }
            // --- End Optional Stock Check ---

            // b. Upsert Cart (Ensure cart exists for the user)
            // Using findUnique + create is slightly more explicit than upsert here
            let cart = await tx.cart.findUnique({
                where: { userId: userId },
            });

            if (!cart) {
                const newCartId = uuidv4(); // Explicitly generate UUID
                cart = await tx.cart.create({
                    data: { id: newCartId, userId: userId }
                });
                // logger.info(`Created new cart ${cart.id} for user: ${userId}`);
            }

            // c. Upsert Cart Item
            await tx.cartItem.upsert({
                where: {
                    // Ensure composite key name matches your schema (`@@unique([cartId, productId])`)
                    cartId_productId: { cartId: cart.id, productId: product.id }
                },
                update: {
                    quantity: { increment: quantity }
                },
                create: {
                    cartId: cart.id,
                    productId: product.id,
                    quantity: quantity
                }
            });

            // --- Optional: Update Product Stock (if tracking) ---
            // await tx.product.update({
            //     where: { id: product.id },
            //     data: { stock: { decrement: quantity } }
            // });
            // --- End Optional Stock Update ---

            // d. Fetch the updated cart state within the transaction for consistency
            const finalCart = await tx.cart.findUnique({
                where: { id: cart.id },
                include: {
                    items: {
                        include: {
                            product: {
                                select: { // Select same fields as getCart
                                    id: true,
                                    name: true,
                                    price: true,
                                    imageUrl: true,
                                }
                            }
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            });

             if (!finalCart) {
                 // This shouldn't happen if cart creation/finding succeeded, but defensive check
                 throw new Error('Failed to retrieve updated cart state.');
             }

            // logger.info(`Successfully updated cart ${cart.id} for user: ${userId}. Added product ${productId}`);
            return finalCart; // Return the full updated cart from the transaction
        }); // End of transaction

        // 5. Return the full, updated cart state
        res.status(200).json(updatedCart); // Use 200 OK as we're returning the final state

    } catch (err) {
        // logger.error('Error adding item to cart:', { userId: req.user?.id, body: req.body, error: err });

        // 6. Handle Specific Errors from Transaction
        if (err.message === 'ProductNotFound') {
            return res.status(404).json({ message: 'Product not found.' });
        }
        if (err.message === 'InsufficientStock') {
             return res.status(400).json({ message: 'Insufficient stock for the requested quantity.' });
        }
        // Handle potential Prisma-specific errors (e.g., constraint violations if schema/logic is wrong)
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            // Example: Unique constraint violation (though upsert handles most common cases)
            if (err.code === 'P2002') {
                 return res.status(409).json({ message: 'Conflict updating cart item.' });
            }
        }

        // Pass general errors to middleware or handle directly
        next(err);
        // Or handle directly:
        // res.status(500).json({ message: 'Failed to add item to cart. Please try again later.' });
    }
};