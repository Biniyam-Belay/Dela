import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from "../prisma/prisma.js";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ').length < 2) {
            return res.status(401).json({ message: 'Access denied - No valid token provided' });
        }

        const token = authHeader.split(' ')[1];

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = { id: user.id, name: user.name, email: user.email };
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token has expired' });
        } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({ message: err.message });
        } else {
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }
};