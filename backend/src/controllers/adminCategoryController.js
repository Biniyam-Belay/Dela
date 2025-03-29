import prisma from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import generateSlug from '../utils/generateSlug.js';

// @desc    Get all categories (Admin view)
// @route   GET /api/v1/admin/categories
// @access  Private/Admin
const getAllCategoriesAdmin = asyncHandler(async (req, res, next) => {
    // Simple fetch for now, add pagination/search later if needed for many categories
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
         // include: { _count: { select: { products: true } } } // Optional: include product count
    });
    res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc    Get single category by ID (Admin view for editing)
// @route   GET /api/v1/admin/categories/:id
// @access  Private/Admin
const getCategoryByIdAdmin = asyncHandler(async (req, res, next) => {
    const category = await prisma.category.findUnique({
        where: { id: req.params.id },
    });

    if (!category) {
        return next(new ApiError(`Category not found with ID: ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: category });
});


// @desc    Create a new category (Admin)
// @route   POST /api/v1/admin/categories
// @access  Private/Admin
const createCategoryAdmin = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    if (!name) {
        return next(new ApiError('Category name is required', 400));
    }

    const slug = generateSlug(name);

    // Check if name or slug already exists
    const existingCategory = await prisma.category.findFirst({
        where: { OR: [{ name }, { slug }] },
    });
    if (existingCategory) {
        return next(new ApiError(`Category name '${name}' or slug '${slug}' already exists.`, 409));
    }

    const category = await prisma.category.create({
        data: {
            name,
            slug,
            description: description || null,
        },
    });

    res.status(201).json({ success: true, data: category });
});

// @desc    Update a category (Admin)
// @route   PUT /api/v1/admin/categories/:id
// @access  Private/Admin
const updateCategoryAdmin = asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existingCategory) {
        return next(new ApiError(`Category not found with ID: ${categoryId}`, 404));
    }

    const dataToUpdate = {};

    if (name && name !== existingCategory.name) {
        dataToUpdate.name = name;
        // Update slug only if name changes
        const newSlug = generateSlug(name);
        if (newSlug !== existingCategory.slug) {
            // Check if the new slug is taken by *another* category
            const slugOwner = await prisma.category.findUnique({ where: { slug: newSlug } });
            if (slugOwner && slugOwner.id !== categoryId) {
                 return next(new ApiError(`Category name '${name}' results in a slug '${newSlug}' that is already in use.`, 409));
            }
            dataToUpdate.slug = newSlug;
        }
    }
    // Allow setting description to null/empty
    if (description !== undefined) {
        dataToUpdate.description = description || null;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(200).json({ success: true, message: "No changes detected", data: existingCategory });
    }

    const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: dataToUpdate,
    });

    res.status(200).json({ success: true, data: updatedCategory });
});


// @desc    Delete a category (Admin)
// @route   DELETE /api/v1/admin/categories/:id
// @access  Private/Admin
const deleteCategoryAdmin = asyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;

    const category = await prisma.category.findUnique({
         where: { id: categoryId },
         // include: { _count: { select: { products: true } } } // Optional: Check product count before deleting
    });
    if (!category) {
        return next(new ApiError(`Category not found with ID: ${categoryId}`, 404));
    }

    // Note: Prisma schema has `onDelete: SetNull` for Product.categoryId.
    // Deleting the category will automatically set the categoryId to null
    // on associated products. No need for manual check here unless you want to warn the user.
    // if (category._count.products > 0) {
    //     // Could optionally return a warning or confirmation prompt info here
    //     console.warn(`Deleting category ${category.name} which is used by ${category._count.products} products.`);
    // }

    await prisma.category.delete({
        where: { id: categoryId },
    });

    res.status(200).json({ success: true, message: 'Category deleted successfully', data: {} });
});


export {
    getAllCategoriesAdmin,
    getCategoryByIdAdmin,
    createCategoryAdmin,
    updateCategoryAdmin,
    deleteCategoryAdmin
};