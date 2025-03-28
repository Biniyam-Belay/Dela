import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors

// Import Routes
import categoryRoutes from './src/routes/categoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
// Import other routes as you create them (auth, cart, order)

// Import Middleware
import errorHandler from './src/middleware/errorHandler.js';
// Import prisma client (optional here, already imported in controllers)
// import prisma from './src/config/db.js';

// Load environment variables
dotenv.config(); // Looks for .env file in the root directory

// Initialize Express app
const app = express();

// --- Middleware ---
// Enable CORS - Configure properly for production later!
app.use(cors({
    // origin: 'http://localhost:5173', // Allow your frontend origin in dev
    // credentials: true // If you need to send cookies
}));

// Body parser middleware to accept JSON
app.use(express.json());
// Body parser middleware to accept URL encoded data
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
// Mount routers
app.get('/api/v1', (req, res) => res.send('SuriAddis API Running')); // Simple health check
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
// Mount other routers here later

// --- Error Handling Middleware ---
// Should be *after* all routes
app.use(errorHandler);


// --- Start Server ---
const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Optional: Graceful shutdown on Prisma disconnect/errors (more advanced)
// process.on('SIGTERM', async () => {
//   console.log('SIGTERM signal received: closing HTTP server')
//   await prisma.$disconnect()
//   server.close(() => {
//     console.log('HTTP server closed')
//   })
// })