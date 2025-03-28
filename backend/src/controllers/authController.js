import prisma from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { hashPassword, comparePassword } from '../utils/passwordHelper.js';
import { generateToken } from '../utils/jwtHelper.js';
import ApiError from '../utils/apiError.js'; // We'll create this custom error class

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // 1. Basic Validation
  if (!email || !password) {
    return next(new ApiError('Please provide email and password', 400)); // Use 400 for bad request
  }
  // Add more robust validation later (e.g., password complexity, email format)

  // 2. Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }, // Store emails in lowercase for consistency
  });

  if (userExists) {
    return next(new ApiError('User already registered with this email', 409)); // Use 409 for conflict
  }

  // 3. Hash password
  const hashedPassword = await hashPassword(password);

  // 4. Create user in database
  try {
        const user = await prisma.user.create({
          data: {
            name: name || `User_${Date.now()}`, // Provide a default name if none given
            email: email.toLowerCase(),
            password: hashedPassword,
            // Role defaults to USER based on Prisma schema
          },
          select: { // Only select fields needed for response (exclude password)
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          }
        });

       // 5. Generate JWT Token
        const token = generateToken(user.id, user.role);

        // 6. Send Response (consider setting token in HttpOnly cookie later for better security)
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          token, // Send token in response body for now
          user: user,
        });

  } catch (error) {
      console.error("Registration Error:", error);
      // Check for specific Prisma errors if needed
      next(new ApiError('User registration failed', 500)); // General server error
  }
});


// @desc    Authenticate user & get token (Login)
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Basic Validation
  if (!email || !password) {
    return next(new ApiError('Please provide email and password', 400));
  }

  // 2. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // 3. Check if user exists and password matches
  if (user && (await comparePassword(password, user.password))) {
     // 4. Generate JWT Token
     const token = generateToken(user.id, user.role);

    // 5. Send Response (exclude password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
      }
    });
  } else {
    // Generic error message for security (don't reveal if email exists or password was wrong)
    return next(new ApiError('Invalid credentials', 401)); // Use 401 for unauthorized
  }
});


// @desc    Get current logged-in user profile
// @route   GET /api/v1/auth/me
// @access  Private (Requires token)
const getMe = asyncHandler(async (req, res, next) => {
    // req.user should be populated by the authMiddleware
    if (!req.user) {
       return next(new ApiError('Not authorized to access this route', 401));
    }

    // Fetch fresh user data (optional, req.user might suffice if populated fully)
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        }
    });

    if (!user) {
        // Should not happen if token was valid and middleware worked, but good check
        return next(new ApiError('User not found', 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});


export { registerUser, loginUser, getMe };