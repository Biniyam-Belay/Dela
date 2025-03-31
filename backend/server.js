import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import categoryRoutes from './src/routes/categoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import adminProductRoutes from './src/routes/adminProductRoutes.js';
import adminCategoryRoutes from './src/routes/adminCategoryRoutes.js';

import errorHandler from './src/middleware/errorHandler.js';
import ApiError from './src/utils/apiError.js';

dotenv.config();
const app = express();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 REMOVE static serving if frontend is deployed separately
// const publicDirectoryPath = path.join(__dirname, 'public');
// app.use(express.static(publicDirectoryPath));
// console.log(`Serving static files from: ${publicDirectoryPath}`);

// API Routes
app.get('/api/v1', (req, res) => res.send('SuriAddis API Running'));
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/admin/categories', adminCategoryRoutes);

// Handle 404 for unknown API routes
app.all('/api/*', (req, res, next) => {
  next(new ApiError(`API route not found: ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
