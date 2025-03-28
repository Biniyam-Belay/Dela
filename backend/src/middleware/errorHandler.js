// NOTE: Make sure this middleware is added *after* all your routes in server.js
const errorHandler = (err, req, res, next) => {
    // Use statusCode from the error if it exists and is a client/server error code, otherwise default to 500
    let statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  
    // If Prisma throws a known error (e.g., RecordNotFound), set a specific status code
    if (err.code === 'P2025') { // Prisma Record to update not found
        statusCode = 404;
    }
     // Add more Prisma error code handling as needed
  
    // Log the error for debugging (use a proper logger like Winston in production)
    console.error(err);
  
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Server Error', // Use error message if available
      // Optionally include stack trace only in development
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  };
  
  export default errorHandler;