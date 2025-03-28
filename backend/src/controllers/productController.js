import prisma from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
import generateSlug from '../utils/generateSlug.js';
import { Prisma } from '@prisma/client'; // Import Prisma types if needed for advanced queries

// @desc    Get all products (with basic filtering/pagination)
// @route   GET /api/v1/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default 10 items per page
    const skip = (page - 1) * limit;

    const { category, search } = req.query;

    let where = {};

    // Add filtering conditions
    if (category) {
        // Find category by slug or ID (assuming slug for now)
        const categoryObj = await prisma.category.findUnique({ where: { slug: category } });
        if (categoryObj) {
            where.categoryId = categoryObj.id;
        } else {
            // Handle case where category slug is invalid - return no products?
             return res.status(200).json({ success: true, count: 0, totalPages: 0, currentPage: page, data: [] });
        }
    }

    if (search) {
        where.OR = [ // Search in name or description
            { name: { contains: search, mode: 'insensitive' } }, // 'insensitive' for case-insensitivity
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    // Get total count for pagination calculation
    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await prisma.product.findMany({
        where,
        skip: skip,
        take: limit,
        orderBy: {
            createdAt: 'desc', // Default sort by newest
        },
        include: { // Optional: Include category info if needed on listing page
           category: {
             select: { name: true, slug: true } // Only select needed fields
           }
        }
    });

    res.status(200).json({
        success: true,
        count: products.length,
        totalPages,
        currentPage: page,
        data: products,
    });
});

// @desc    Get single product by slug or ID
// @route   GET /api/v1/products/:identifier
// @access  Public
const getProductByIdentifier = asyncHandler(async (req, res) => {
    const { identifier } = req.params;

    // Try finding by slug first, then by ID if slug fails
    let product = await prisma.product.findUnique({
        where: { slug: identifier },
        include: { category: { select: { name: true, slug: true } } } // Include category details
    });

    // Basic check if identifier looks like a CUID before trying ID lookup
    if (!product && identifier.length === 25 && identifier.startsWith('c')) {
       try {
            product = await prisma.product.findUnique({
                where: { id: identifier },
                include: { category: { select: { name: true, slug: true } } }
            });
       } catch (error) {
            // Ignore errors if ID format is wrong, means it wasn't an ID
       }
    }

    if (!product) {
        res.status(404);
        throw new Error(`Product not found with identifier: ${identifier}`);
    }

    res.status(200).json({ success: true, data: product });
});

// --- Admin Functionality (We'll implement fully later) ---

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    // Destructure required fields (add more as needed: images, categoryId, etc.)
    const { name, description, price, stockQuantity, categoryId, images } = req.body;

    // Basic Validation
    if (!name || !description || !price || !stockQuantity ) {
        res.status(400);
        throw new Error('Please provide name, description, price, and stock quantity');
    }

    const slug = generateSlug(name);

    // Check if product slug already exists (names can be similar, slugs must be unique)
     const existingProduct = await prisma.product.findUnique({ where: { slug } });
     if (existingProduct) {
        res.status(409); // Conflict
        throw new Error(`Product with slug '${slug}' already exists. Choose a different name.`);
     }

    // Validate categoryId if provided
    if (categoryId) {
        const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!categoryExists) {
            res.status(400);
            throw new Error(`Invalid category ID: ${categoryId}`);
        }
    }

    // Convert price to Decimal (Prisma expects specific type)
    const priceDecimal = new Prisma.Decimal(price);


    const product = await prisma.product.create({
        data: {
            name,
            slug,
            description,
            price: priceDecimal,
            stockQuantity: parseInt(stockQuantity, 10), // Ensure integer
            categoryId: categoryId || null, // Handle optional category
            images: images || [], // Default to empty array if not provided
        },
    });

    res.status(201).json({ success: true, data: product });
});

export { getAllProducts, getProductByIdentifier, createProduct }; // Add more exports later