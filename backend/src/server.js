import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors middleware
import morgan from 'morgan'; // Assuming you use morgan for logging

// Import your routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
// ... import other routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// CORS Configuration
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Default Vite port, adjust if needed
const corsOptions = {
  origin: frontendURL, // Allow only your frontend origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
  credentials: true, // Allow cookies if needed for sessions/auth tokens
  optionsSuccessStatus: 204 // Some legacy browsers choke on 204
};
app.use(cors(corsOptions)); // Use cors middleware

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging (optional)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// ... use other routes

// --- Basic Root Route (for testing if server is up) ---
app.get('/', (req, res) => {
  res.send('Backend Server is Running');
});

// --- Error Handling Middleware (example) ---
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Allowing requests from origin: ${frontendURL}`);
});

// Export app if needed for testing or other modules
// export default app;
