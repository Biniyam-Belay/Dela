import prisma from '../config/db.js'; // Assuming db.js exports the Prisma client instance
import asyncHandler from '../middleware/asyncHandler.js'; // We'll create this utility soon
import generateSlug from '../utils/generateSlug.js'; // We'll create this utility

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc', // Optional: Order alphabetically by name
    },
  });
  res.status(200).json({ success: true, count: categories.length, data: categories });
});

// --- Admin Functionality (We'll implement fully later) ---

// @desc    Create a new category
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400); // Bad Request
    throw new Error('Category name is required');
  }

  const slug = generateSlug(name); // Generate slug from name

  // Check if category or slug already exists
  const existingCategory = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });

  if (existingCategory) {
    res.status(409); // Conflict
    throw new Error('Category name or slug already exists');
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
    },
  });

  res.status(201).json({ success: true, data: category });
});


export { getAllCategories, createCategory }; // Add more exports as you create them (update, delete)