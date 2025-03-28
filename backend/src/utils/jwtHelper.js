import jwt from 'jsonwebtoken';

// Generate a JWT token
export const generateToken = (userId, userRole) => {
  // Ensure JWT_SECRET is set in your .env file!
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d'; // Default to 30 days expiration

  if (!secret) {
      console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
      throw new Error('Server configuration error: JWT Secret not set.'); // Don't expose internal details
  }

  const payload = {
    userId: userId, // Include user ID in the token payload
    role: userRole, // Include user role for authorization checks
    // You could add other non-sensitive info if needed
  };

  return jwt.sign(payload, secret, { expiresIn });
};

// Verify a JWT token (will be used in authMiddleware)
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
   if (!secret) {
       console.error('FATAL ERROR: JWT_SECRET is not defined.');
       throw new Error('Server configuration error.');
   }
  try {
    return jwt.verify(token, secret); // Returns the decoded payload if valid
  } catch (error) {
    // Handle specific errors like TokenExpiredError, JsonWebTokenError later if needed
    return null; // Return null if verification fails
  }
};