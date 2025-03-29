// backend/src/controllers/adminProductController.js

import prisma from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import generateSlug from '../utils/generateSlug.js';
import { Prisma } from '@prisma/client';
import fs from 'fs'; // Node.js File System module
import path from 'path'; // Node.js Path module
import { fileURLToPath } from 'url'; // Helper for ES Modules __dirname equivalent

// --- Helper: Get Public URL Path ---
// Constructs the relative path used in URLs based on static serving config
const getImagePath = (filename) => {
    // Output: /uploads/products/filename.jpg
    return `/uploads/products/${filename}`;
}

// --- Helper: Get Absolute Filesystem Path (for file operations like delete) ---
const getAbsoluteServerPath = (relativePath) => {
    if (!relativePath || typeof relativePath !== 'string' || !relativePath.startsWith('/')) {
        console.warn(`Invalid relative path received for filesystem operation: ${relativePath}`);
        return null;
    }
    try {
        const __filename = fileURLToPath(import.meta.url); // Path to this controller file
        const __dirname = path.dirname(__filename);       // Directory: /path/to/backend/src/controllers
        // Go UP TWO levels from src/controllers to get to the backend/ directory
        const projectRoot = path.resolve(__dirname, '../..');
        // Join project root, 'public', and the relative path (removing its leading '/')
        return path.join(projectRoot, 'public', relativePath.substring(1));
    } catch (error) {
        console.error("Error calculating absolute server path:", error);
        return null;
    }
}

// --- Helper: Cleanup Uploaded Files on Error ---
// Deletes files uploaded in the current request if subsequent processing fails
 const cleanupUploadedFilesOnError = (req) => {
     if (req.files && req.files.length > 0) {
        console.log(`Cleaning up ${req.files.length} uploaded file(s) due to error...`);
        req.files.forEach(file => {
            fs.unlink(file.path, err => { // file.path is the absolute path where multer saved it
                if (err) {
                    // Log error but don't crash the cleanup process
                    console.error(`Error cleaning up file ${file.path}:`, err);
                } else {
                    console.log(`Cleaned up temporary file: ${file.path}`);
                }
            });
        });
     }
}

// --- Controller Functions ---

// @desc    Get all products (Admin view with pagination)
// @route   GET /api/v1/admin/products
// @access  Private/Admin
const getAllProductsAdmin = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default 10 per page
    const skip = (page - 1) * limit;

    const { search } = req.query;
    let where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }
    // Admins see all products regardless of isActive status (add filter later if needed)
    // where.isActive = true; // Uncomment if admins should only see active by default

    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } } }
    });

    res.status(200).json({
        success: true,
        count: products.length,
        totalProducts,
        totalPages,
        currentPage: page,
        data: products,
    });
});

// @desc    Get single product by ID (Admin view for editing)
// @route   GET /api/v1/admin/products/:id
// @access  Private/Admin
const getProductByIdAdmin = asyncHandler(async (req, res, next) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id },
         include: { category: true } // Include full category details
    });

    if (!product) {
        return next(new ApiError(`Product not found with ID: ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: product });
});


// @desc    Create a new product (Admin) - Handles Uploads
// @route   POST /api/v1/admin/products
// @access  Private/Admin
const createProductAdmin = asyncHandler(async (req, res, next) => {
    console.log("--- Create Product Request ---");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    // Destructure all potential fields from the request body
    const {
        name, description, price, stockQuantity, categoryId, images: imagesFromBody, // 'images' in body might contain existing URLs if form allows
        rating, reviewCount, originalPrice, sellerName, sellerLocation, unitsSold
     } = req.body;

    // --- Basic Validation ---
    if (!name || !description || price === undefined || stockQuantity === undefined) {
         cleanupUploadedFilesOnError(req);
        return next(new ApiError('Please provide name, description, price, and stock quantity', 400));
    }

    // --- Prepare Image Paths from uploaded files ---
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => getImagePath(file.filename)); // Use helper for correct path
    }
    console.log("Generated Image Paths from Upload:", imagePaths);

    // --- Data Preparation & Validation (Slug, Category, Types) ---
     const slug = generateSlug(name);
     // Check for slug collision before proceeding
     const existingSlug = await prisma.product.findUnique({ where: { slug } });
     if (existingSlug) {
         cleanupUploadedFilesOnError(req); // Cleanup uploads if slug exists
         return next(new ApiError(`Product slug '${slug}' derived from name is already in use. Choose a different name.`, 409));
     }

     // Validate Category ID if provided
     let categoryData = undefined;
     if (categoryId && categoryId !== '') { // Check for non-empty categoryId
         const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
         if (!categoryExists) {
            cleanupUploadedFilesOnError(req);
            return next(new ApiError(`Invalid category ID provided: ${categoryId}`, 400));
         }
         categoryData = { connect: { id: categoryId } }; // Prepare Prisma connect object
     }

     // --- Construct Data for Prisma ---
     // Carefully parse numeric types and handle optional fields
    const dataToCreate = {
        name: name,
        slug: slug,
        description: description,
        price: new Prisma.Decimal(price), // Use Prisma.Decimal for currency
        stockQuantity: parseInt(stockQuantity, 10), // Ensure integer
        images: imagePaths, // Assign the array of URL paths
        category: categoryData, // Assign connect object or undefined
        isActive: true, // Default new products to active
        // Optional fields: Provide defaults or parse values, handle null/undefined
        rating: rating ? parseFloat(rating) : 0,
        reviewCount: reviewCount ? parseInt(reviewCount, 10) : 0,
        originalPrice: originalPrice ? new Prisma.Decimal(originalPrice) : null,
        sellerName: sellerName || null,
        sellerLocation: sellerLocation || null,
        unitsSold: unitsSold ? parseInt(unitsSold, 10) : 0,
    };
    console.log("--- Data to Create in DB ---:", JSON.stringify(dataToCreate, null, 2));

    // --- Create Product in Database ---
    try {
        const product = await prisma.product.create({ data: dataToCreate });
        console.log("Product created successfully:", product.id);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
         cleanupUploadedFilesOnError(req); // Attempt cleanup on DB error
         console.error("Product Creation DB Error:", error);
         // Check for specific Prisma errors if needed (e.g., unique constraints not caught earlier)
         next(new ApiError('Failed to save product to database. Check server logs.', 500));
    }
});

// @desc    Update a product (Admin) - Handles Uploads
// @route   PUT /api/v1/admin/products/:id
// @access  Private/Admin
const updateProductAdmin = asyncHandler(async (req, res, next) => {
    const productId = req.params.id;
    console.log(`--- Update Product Request for ID: ${productId} ---`);
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    // Separate field that might contain existing images JSON from other data
    const { images: existingImageUrlsJson, ...otherData } = req.body;

    // --- Find existing product ---
    const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
    if (!existingProduct) {
        cleanupUploadedFilesOnError(req); // Clean up any potentially uploaded files if product not found
        return next(new ApiError(`Product not found with ID: ${productId}`, 404));
     }

    // --- Handle Images ---
    let finalImagePaths = [];
    let imagesToDeleteFromFS = []; // Store *relative* paths of old images to delete from filesystem

    // 1. Determine which existing images to keep based on input
    let existingImagesToKeep = [];
    if (existingImageUrlsJson !== undefined) { // Check if the 'images' field was explicitly sent
        try {
            // Expecting a JSON string array like '["/path/1.jpg", "/path/2.jpg"]'
            const parsedImages = JSON.parse(existingImageUrlsJson);
            if (Array.isArray(parsedImages)) {
                existingImagesToKeep = parsedImages;
            } else {
                 console.warn(`Parsed 'images' field was not an array:`, parsedImages);
                 // Fallback: If invalid format sent, assume keep original images for safety
                 existingImagesToKeep = existingProduct.images || [];
            }
        } catch (e) {
             console.warn("Could not parse 'images' field JSON:", existingImageUrlsJson, e);
             // Fallback: Keep original images if parsing fails
             existingImagesToKeep = existingProduct.images || [];
        }
    } else {
         // If 'images' field not sent at all in the body, assume keep all existing images
         existingImagesToKeep = existingProduct.images || [];
    }

    // 2. Identify files to delete from filesystem (those in original list but not in 'to keep' list)
    imagesToDeleteFromFS = (existingProduct.images || []).filter(img => !existingImagesToKeep.includes(img));
    console.log("Existing images parsed/determined to keep:", existingImagesToKeep);
    console.log("Old images marked for FS deletion:", imagesToDeleteFromFS);

    // 3. Add paths for newly uploaded files
    let newImagePaths = [];
    if (req.files && req.files.length > 0) {
        newImagePaths = req.files.map(file => getImagePath(file.filename));
        console.log("New image paths to add from upload:", newImagePaths);
    }

    // 4. Combine kept and new images for the final DB array
    finalImagePaths = [...existingImagesToKeep, ...newImagePaths];

    // --- Data Preparation & Validation for Update ---
    const dataToUpdate = {};

    // Name & Slug handling
    if (otherData.name && otherData.name !== existingProduct.name) {
        dataToUpdate.name = otherData.name;
        const newSlug = generateSlug(otherData.name);
        if (newSlug !== existingProduct.slug) {
             const slugOwner = await prisma.product.findUnique({ where: { slug: newSlug } });
             // Ensure the found slug doesn't belong to ANOTHER product
             if (slugOwner && slugOwner.id !== productId) {
                 cleanupUploadedFilesOnError(req);
                 return next(new ApiError(`Product slug '${newSlug}' derived from name is already in use.`, 409));
             }
             dataToUpdate.slug = newSlug;
        }
    }

    // Update other fields only if they exist in the request body
    if (otherData.description !== undefined) dataToUpdate.description = otherData.description;
    if (otherData.price !== undefined) dataToUpdate.price = new Prisma.Decimal(otherData.price);
    if (otherData.stockQuantity !== undefined) dataToUpdate.stockQuantity = parseInt(otherData.stockQuantity, 10);
    if (otherData.isActive !== undefined) dataToUpdate.isActive = Boolean(otherData.isActive); // Handle isActive toggle
    if (otherData.rating !== undefined) dataToUpdate.rating = otherData.rating ? parseFloat(otherData.rating) : null;
    if (otherData.reviewCount !== undefined) dataToUpdate.reviewCount = otherData.reviewCount ? parseInt(otherData.reviewCount, 10) : null;
    if (otherData.originalPrice !== undefined) dataToUpdate.originalPrice = otherData.originalPrice ? new Prisma.Decimal(otherData.originalPrice) : null;
    if (otherData.sellerName !== undefined) dataToUpdate.sellerName = otherData.sellerName || null;
    if (otherData.sellerLocation !== undefined) dataToUpdate.sellerLocation = otherData.sellerLocation || null;
    if (otherData.unitsSold !== undefined) dataToUpdate.unitsSold = otherData.unitsSold ? parseInt(otherData.unitsSold, 10) : null;

    // Category update/disconnect logic
    if (otherData.categoryId !== undefined) {
        if (otherData.categoryId === null || otherData.categoryId === '') {
             // Only disconnect if it currently has a category
            if (existingProduct.categoryId) {
                dataToUpdate.category = { disconnect: true };
            }
        } else {
            const categoryExists = await prisma.category.findUnique({ where: { id: otherData.categoryId } });
             if (!categoryExists) {
                cleanupUploadedFilesOnError(req); // Cleanup uploads if category is invalid
                return next(new ApiError(`Invalid category ID: ${otherData.categoryId}`, 400));
             }
             // Connect only if it's different from the current category or if currently null
             if (existingProduct.categoryId !== otherData.categoryId) {
                dataToUpdate.category = { connect: { id: otherData.categoryId } };
             }
        }
    }

    // 5. Determine if the final image array differs from the original
    const imagesChanged = JSON.stringify(finalImagePaths.sort()) !== JSON.stringify((existingProduct.images || []).sort());
    if (imagesChanged) {
        dataToUpdate.images = finalImagePaths;
        console.log("Final image paths for DB update:", finalImagePaths);
    } else {
        console.log("No image changes detected for DB update.");
    }

    // --- Perform Update ---
    if (Object.keys(dataToUpdate).length === 0) {
       // Check if only files were uploaded but no other text fields changed
       // This case should be handled by `imagesChanged` check above, but as safety:
       if (req.files && req.files.length > 0 && !imagesChanged) {
            console.warn("New files uploaded, but final image array didn't change? Check logic.");
       }
       console.log("No data fields to update.");
       // Still attempt to delete files if they were marked for deletion
       imagesToDeleteFromFS.forEach(relativePath => { /* ... delete file logic ... */ });
       return res.status(200).json({ success: true, message: "No changes detected to update", data: existingProduct });
    }
    console.log("--- Data to Update in DB ---:", JSON.stringify(dataToUpdate, null, 2));

    try {
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: dataToUpdate,
        });
        console.log("Product updated successfully:", updatedProduct.id);

        // --- Delete old image files AFTER successful DB update ---
        imagesToDeleteFromFS.forEach(relativePath => {
            const absolutePath = getAbsoluteServerPath(relativePath);
            if (absolutePath && fs.existsSync(absolutePath)) {
                fs.unlink(absolutePath, (err) => {
                    if (err) console.error(`Error deleting old image file ${absolutePath}:`, err);
                    else console.log(`Deleted old image file: ${absolutePath}`);
                });
            } else if (absolutePath) {
                 console.warn(`Old image file not found for deletion: ${absolutePath}`);
            }
        });

        res.status(200).json({ success: true, data: updatedProduct });
    } catch(error) {
         cleanupUploadedFilesOnError(req); // Clean up *new* uploads if DB update fails
         console.error("Product Update DB Error:", error);
         next(new ApiError('Failed to update product in database. Check server logs.', 500));
    }
});


// @desc    Delete a product (Admin) - Includes File Deletion
// @route   DELETE /api/v1/admin/products/:id
// @access  Private/Admin
const deleteProductAdmin = asyncHandler(async (req, res, next) => {
    const productId = req.params.id;
    console.log(`--- Delete Product Request for ID: ${productId} ---`);

    // Find product to get image paths BEFORE deleting DB record
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
        // Still return success maybe, or 404? Let's return 404.
        return next(new ApiError(`Product not found with ID: ${productId}`, 404));
    }

    // Check dependencies (prevent deletion if in use)
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: productId } });
    if (orderItemsCount > 0) {
         return next(new ApiError(`Cannot delete product. It exists in ${orderItemsCount} order(s). Disable the product instead (set isActive to false).`, 400));
    }
    // Add checks for CartItems if using backend cart

    // Store image paths for deletion after DB operation succeeds
     const imagePathsToDelete = product.images || [];
     console.log("Image paths marked for FS deletion:", imagePathsToDelete);

    try {
        // --- Delete DB Record FIRST ---
        await prisma.product.delete({ where: { id: productId } });
        console.log("Product deleted successfully from DB:", productId);

        // --- Delete image files AFTER successful DB delete ---
        let deletionErrors = [];
        imagePathsToDelete.forEach(relativePath => {
            const absolutePath = getAbsoluteServerPath(relativePath);
            if (absolutePath && fs.existsSync(absolutePath)) {
                try {
                    fs.unlinkSync(absolutePath); // Use synchronous for simplicity here, or handle async with Promise.all
                    console.log(`Deleted image file: ${absolutePath}`);
                } catch (err) {
                     console.error(`Error deleting image file ${absolutePath}:`, err);
                     deletionErrors.push(absolutePath); // Collect errors
                }
            } else if (absolutePath) {
                 console.warn(`Image file not found for deletion: ${absolutePath}`);
            }
        });

        let message = 'Product deleted successfully.';
        if (deletionErrors.length > 0) {
            message += ` Could not delete image files: ${deletionErrors.join(', ')}`;
        }
        res.status(200).json({ success: true, message: message, data: {} });

    } catch (error) {
         console.error("Product Deletion DB Error:", error);
         // Handle potential Prisma errors
         next(new ApiError('Failed to delete product from database. Check server logs.', 500));
    }
});

// --- Export all functions ---
export {
    getAllProductsAdmin,
    getProductByIdAdmin,
    createProductAdmin,
    updateProductAdmin,
    deleteProductAdmin
};