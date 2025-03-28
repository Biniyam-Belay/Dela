import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import ApiError from '../utils/apiError.js';
import prisma from '../config/db.js';

// Middleware to protect routes that require authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  // Add checks for token in cookies later if you switch to HttpOnly cookies
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // 2. Verify token exists
  if (!token) {
    return next(new ApiError('Not authorized, no token provided', 401));
  }

  // 3. Verify token validity
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch user based on token payload (ensure user still exists)
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { // Select only necessary fields to attach to req.user
         id: true,
         name: true,
         email: true,
         role: true // Important for authorization checks
       }
    });

    if (!currentUser) {
       return next(new ApiError('User belonging to this token no longer exists', 401));
    }

    // 5. Attach user object to the request object
    req.user = currentUser;
    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    console.error('Token Verification Error:', error);
    // Handle specific JWT errors if needed (already done partially in global handler)
    return next(new ApiError('Not authorized, token failed verification', 401));
  }
});


// Middleware to check for specific roles (e.g., Admin)
const authorize = (...roles) => { // Takes an array of allowed roles
    return (req, res, next) => {
        // Assumes 'protect' middleware has already run and attached req.user
        if (!req.user) {
            // Should ideally be caught by 'protect', but double-check
            return next(new ApiError('Not authorized', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ApiError(`User role '${req.user.role}' is not authorized to access this route`, 403)); // 403 Forbidden
        }
        next(); // User has the required role
    };
};


export { protect, authorize }; // Export both middleware functions