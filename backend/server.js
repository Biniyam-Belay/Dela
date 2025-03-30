import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import Routes
import categoryRoutes from "./src/routes/categoryRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import adminProductRoutes from "./src/routes/adminProductRoutes.js";
import adminCategoryRoutes from "./src/routes/adminCategoryRoutes.js";

// Import Middleware
import errorHandler from "./src/middleware/errorHandler.js";
import ApiError from "./src/utils/apiError.js";

dotenv.config();
const app = express();

// ES Module Fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files (Only if Needed)
const publicDirectoryPath = path.join(__dirname, "public");
app.use(express.static(publicDirectoryPath));
console.log(`Serving static files from: ${publicDirectoryPath}`);

// Default Root Route (Fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});

// API Routes
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin/products", adminProductRoutes);
app.use("/api/v1/admin/categories", adminCategoryRoutes);

// Handle Not Found API Routes
app.all("/api/*", (req, res, next) => {
  next(new ApiError(`API route not found: ${req.originalUrl}`, 404));
});

// Global Error Handling Middleware
app.use(errorHandler);

// Serve Frontend (If Fullstack on Same Server)
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDirectoryPath, "index.html"));
});

// Start Server (Render Uses process.env.PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
