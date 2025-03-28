import prisma from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { Prisma } from '@prisma/client'; // Import Prisma types if needed

// --- Helper Function to Calculate Order Amount (Reuse/Adapt from checkoutController) ---
// This remains crucial for setting the correct total on the order record
const calculateOrderAmountAndValidateStock = async (items) => {
  if (!items || items.length === 0) {
    throw new ApiError('No items provided for order.', 400);
  }

  const productIds = items.map(item => item.productId);
  const productsFromDb = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, stockQuantity: true, name: true }
  });

  let totalAmount = new Prisma.Decimal(0);
  const orderItemsData = []; // Prepare data for OrderItem creation

  for (const item of items) {
    const product = productsFromDb.find(p => p.id === item.productId);

    if (!product) {
      throw new ApiError(`Product with ID ${item.productId} not found.`, 404);
    }
    if (product.stockQuantity < item.quantity) {
      throw new ApiError(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`, 400);
    }
    if (item.quantity <= 0) {
         throw new ApiError(`Invalid quantity (${item.quantity}) for product ${product.name}.`, 400);
    }

    const price = new Prisma.Decimal(product.price); // Use Prisma.Decimal
    const itemTotal = price.mul(item.quantity); // Multiply using Decimal methods
    totalAmount = totalAmount.add(itemTotal); // Add using Decimal methods

    orderItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      priceAtPurchase: price // Store price at the time of purchase
    });
  }

  // Return both total and the prepared item data, plus product details for stock update
  return {
      totalAmount, // Already a Decimal
      orderItemsData,
      productsFromDb // Needed for stock decrement later
  };
};


// @desc    Create a new order
// @route   POST /api/v1/orders
// @access  Private (User must be logged in)
const createOrder = asyncHandler(async (req, res, next) => {
  const { orderItems, shippingAddress } = req.body; // Expecting cart items and shipping address
  const userId = req.user.id; // Get user ID from protect middleware

  // Basic validation
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return next(new ApiError('Order items are required.', 400));
  }
  if (!shippingAddress || typeof shippingAddress !== 'object' || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country ) {
      // Add more specific address validation as needed
    return next(new ApiError('Valid shipping address is required.', 400));
  }

  try {
    // --- Use Prisma Transaction for Atomic Operations ---
    const result = await prisma.$transaction(async (tx) => {
        // 1. Calculate Total and Validate Stock within the transaction context (tx)
        // We pass the raw items [{productId, quantity}]
        const { totalAmount, orderItemsData, productsFromDb } = await calculateOrderAmountAndValidateStock(orderItems);

        // Check if total amount is valid
        if (totalAmount.lessThanOrEqualTo(0)) {
             throw new ApiError('Order total must be positive.', 400);
        }

        // 2. Create the Order record
        const order = await tx.order.create({
            data: {
                userId: userId,
                totalAmount: totalAmount, // Already Decimal
                shippingAddress: shippingAddress, // Store as JSON
                // billingAddress: billingAddress || shippingAddress, // Optional
                status: 'PENDING', // Default status, update later based on payment
                items: {
                    create: orderItemsData.map(item => ({ // Use nested create for order items
                        productId: item.productId,
                        quantity: item.quantity,
                        priceAtPurchase: item.priceAtPurchase // Store price snapshot
                    }))
                }
            },
            include: { // Include items in the response
                items: {
                   include: {
                       product: { select: { name: true, images: true }} // Include product name/image in response
                   }
                }
            }
        });

        // 3. Decrement stock levels for each product
        const stockUpdatePromises = orderItemsData.map(item => {
            const product = productsFromDb.find(p => p.id === item.productId);
            // Double check stock again before decrementing (though calculateOrderAmountAndValidateStock should catch it)
            if (!product || product.stockQuantity < item.quantity) {
                 throw new ApiError(`Stock level changed for product ${product?.name || item.productId}. Please review your cart.`, 409); // 409 Conflict
            }

            return tx.product.update({
                where: { id: item.productId },
                data: {
                    stockQuantity: {
                        decrement: item.quantity
                    }
                }
            });
        });

        await Promise.all(stockUpdatePromises);


       // 4. Clear User's Cart (Optional: if using backend cart, not just frontend localStorage)
       // If you implement a backend Cart model linked to the user:
       // const userCart = await tx.cart.findUnique({ where: { userId } });
       // if (userCart) {
       //     await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
       // }

        return order; // Return the created order from the transaction block
    }); // End of Prisma Transaction

    // If transaction is successful:
    res.status(201).json({
        success: true,
        message: 'Order created successfully.',
        data: result // The created order with included items
    });

  } catch (error) {
    console.error("Order Creation Error:", error);
    // Handle specific errors (e.g., stock validation, Prisma errors)
    if (error instanceof ApiError) {
      return next(error);
    }
    // Check for Prisma transaction errors specifically if needed
    next(new ApiError(`Failed to create order: ${error.message}`, 500));
  }
});


// @desc    Get logged in user's orders
// @route   GET /api/v1/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
    const orders = await prisma.order.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: { // Include details about the items in each order
               include: {
                    product: { select: { id: true, name: true, slug: true, images: true }}
               }
            }
        }
    });

    res.status(200).json({ success: true, count: orders.length, data: orders });
});


// @desc    Get single order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res, next) => {
    const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
            user: { select: { name: true, email: true }}, // Include basic user info
            items: {
               include: {
                    product: { select: { id: true, name: true, slug: true, images: true, price: true }}
               }
            }
        }
    });

    if (!order) {
        return next(new ApiError(`Order not found with ID: ${req.params.id}`, 404));
    }

    // Authorization Check: Ensure the logged-in user owns this order OR is an admin
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
         return next(new ApiError('Not authorized to view this order', 403));
    }

    res.status(200).json({ success: true, data: order });
});


// --- Placeholder for Payment Update (When implementing Chapa/Stripe later) ---
// @desc    Update order to paid (e.g., after webhook confirmation)
// @route   PUT /api/v1/orders/:id/pay
// @access  Private/Admin or handled by webhook service
const updateOrderToPaid = asyncHandler(async (req, res, next) => {
    // This would typically be called after successful payment confirmation
    // from your payment gateway (e.g., via a webhook handler)
    const orderId = req.params.id;
    // const { paymentResult } = req.body; // Payment details from gateway

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
        return next(new ApiError(`Order not found with ID: ${orderId}`, 404));
    }

    // TODO: Add logic here to verify payment success (important!)

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
            status: 'PROCESSING', // Or 'PAID', 'COMPLETED' depending on your flow
            // paidAt: new Date(), // Record payment time
            // paymentResult: { // Store payment confirmation details (optional)
            //     id: paymentResult.id,
            //     status: paymentResult.status,
            //     update_time: paymentResult.update_time,
            //     email_address: paymentResult.payer.email_address,
            // },
        },
    });

    res.status(200).json({ success: true, data: updatedOrder });
});

export { createOrder, getMyOrders, getOrderById, updateOrderToPaid };