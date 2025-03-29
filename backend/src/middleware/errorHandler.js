// backend/src/middleware/errorHandler.js
import multer from 'multer';
import ApiError from "../utils/apiError.js";
import { MAX_FILE_SIZE_MB } from './uploadMiddleware.js'; // Import max size

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error("ERROR STACK:", err.stack); // Keep detailed logs for debugging
    console.error("ERROR FULL:", err);

    let statusCode = 500;
    let message = 'Server Error';

    // Multer Error Handling
    if (err instanceof multer.MulterError) {
        statusCode = 400; // Bad Request is suitable for client errors like this
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = `File too large. Maximum size allowed is ${MAX_FILE_SIZE_MB}MB.`;
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files uploaded.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file field received.';
        } else {
             message = `File upload error: ${err.message}`;
        }
    }
    // Custom Operational Errors
    else if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Prisma Known Errors (Examples)
    else if (err.code === 'P2002') { // Unique constraint failed
       statusCode = 409; // Conflict
       const field = err.meta?.target?.[0] || 'field';
       message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    } else if (err.code === 'P2025') { // Record not found
       statusCode = 404;
       message = 'Resource not found.';
    }
    // JWT Errors
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
         statusCode = 401;
         message = err.message.includes('expired') ? 'Your session has expired. Please log in again.' : 'Invalid token. Please log in again.';
    }
    // Fallback for other errors if needed

    res.status(statusCode).json({
        success: false,
        error: message,
        // Optionally include stack only in development
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

export default errorHandler;