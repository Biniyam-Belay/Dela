// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes (paths relative to server.js)
import categoryRoutes from './src/routes/categoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import adminProductRoutes from './src/routes/adminProductRoutes.js';
import adminCategoryRoutes from './src/routes/adminCategoryRoutes.js';

// Import Middleware (paths relative to server.js)
import errorHandler from './src/middleware/errorHandler.js';
import ApiError from './src/utils/apiError.js'; // Correct path if ApiError is in utils

dotenv.config(); // Loads .env from the current directory (backend/)
const app = express();

// --- ES Module specifics for __dirname ---
const __filename = fileURLToPath(import.meta.url); // Full path to server.js
const __dirname = path.dirname(__filename);       // Directory of server.js (e.g., /path/to/backend/)

// projectRoot is simply __dirname in this case, as server.js is at the root level we care about
const projectRoot = __dirname;
// Alternatively, if you prefer consistency with the previous calculation style:
// const projectRoot = path.resolve(__dirname); // Resolves to the absolute path of backend/

// --- Core Middleware ---
app.use(cors({ /* Configure CORS properly */ }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static Folder ---
// Serve files from the 'public' directory located directly inside the project root (__dirname)
const publicDirectoryPath = path.join(projectRoot, 'public');
app.use(express.static(publicDirectoryPath));
console.log(`Serving static files from: ${publicDirectoryPath}`); // Log path for verification

// --- API Routes ---
app.get('/api/v1', (req, res) => res.send('SuriAddis API Running'));
// Public/User Routes
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
// Admin Routes
app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/admin/categories', adminCategoryRoutes);

// --- Handle Not Found API Routes ---
 app.all('/api/*', (req, res, next) => {
     next(new ApiError(`API route not found: ${req.originalUrl}`, 404));
 });

// --- Global Error Handling Middleware --- (Must be last app.use before listen)
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
    process.exit(1);
});