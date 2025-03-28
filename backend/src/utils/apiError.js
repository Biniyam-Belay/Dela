// Custom error class for more structured API errors
class ApiError extends Error {
    constructor(message, statusCode) {
      super(message); // Call parent constructor (Error)
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // Client vs Server error
      this.isOperational = true; // Flag for operational errors (vs programming errors)
  
      // Capture stack trace, excluding constructor call from it
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default ApiError;