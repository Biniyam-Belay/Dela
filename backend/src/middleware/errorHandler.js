import ApiError from "../utils/apiError.js"; // Import custom error class

const errorHandler = (err, req, res, next) => {
    // Copy error properties
    let error = { ...err };
    error.message = err.message; // Ensure message property is copied

    // Log the original error for debugging (especially non-operational errors)
    console.error("ERROR STACK:", err.stack);
    console.error("ERROR FULL:", err);

    let statusCode = 500; // Default to 500
    let message = 'Server Error';

    // Use statusCode and message from ApiError if it's one of ours
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.code === 'P2002') { // Prisma unique constraint violation
       statusCode = 409; // Conflict
       // Try to get the field name (might be complex depending on constraint)
       const field = err.meta?.target?.[0] || 'field';
       message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    } else if (err.code === 'P2025') { // Prisma Record not found (for update/delete)
       statusCode = 404;
       message = 'Resource not found.';
    }
    // Add more specific error handling here (Prisma codes, JWT errors etc.)
     else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please log in again.';
    } else if (err.name === 'TokenExpiredError') {
         statusCode = 401;
         message = 'Your session has expired. Please log in again.';
    }


    // Final response
    res.status(statusCode).json({
        success: false,
        error: message, // Use 'error' key for consistency
        // Optionally include stack only in development
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

export default errorHandler;