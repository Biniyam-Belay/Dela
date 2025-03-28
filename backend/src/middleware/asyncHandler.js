// Simple wrapper to avoid try...catch blocks in every async controller
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next); // Pass errors to Express error handler
  
  export default asyncHandler;