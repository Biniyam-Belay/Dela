import prisma from "../prisma/prisma.js";

export const createOrder = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: { userId: req.user.id },
            include: { items: { include: { product: true } } }
        });
        if (!cart || !cart.items.length) return res.status(400).json({ message: 'Cart is empty' });

        const total = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: req.user.id,
                    total,
                    items: {
                        create: cart.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price
                        }))
                    }
                }
            });
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            return newOrder;
        });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: { items: { include: { product: true } } }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' });
    }
};