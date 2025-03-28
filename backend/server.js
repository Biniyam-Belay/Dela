import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// import cookieParser from 'cookie-parser'; // Install and uncomment if using cookies later

// Import Routes
import categoryRoutes from './src/routes/categoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js'; // Import auth routes
// Import other routes
import orderRoutes from './src/routes/orderRoutes.js'; // Import order routes

// Import Middleware
import errorHandler from './src/middleware/errorHandler.js';
import ApiError from './src/utils/apiError.js'; // Import ApiError for root level errors if needed

dotenv.config();
const app = express();

// --- Middleware ---
app.use(cors({ /* Configure CORS properly */ }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser()); // Uncomment if using cookies later

// --- API Routes ---
app.get('/api/v1', (req, res) => res.send('SuriAddis API Running'));
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auth', authRoutes); // Mount auth routes
app.use('/api/v1/orders', orderRoutes); // Mount order routes
// Mount other routers

// --- Handle Not Found Routes ---
 app.all('*', (req, res, next) => {
     next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
 });


// --- Global Error Handling Middleware --- (Must be last)
app.use(errorHandler);


// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    // Close server & exit process
    // In production, might use a process manager like PM2 to restart
    process.exit(1); // Exit immediately (can be debated, maybe close server first)
});