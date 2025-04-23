import { supabase } from '../utils/supabaseClient'; // Assuming you have a supabaseClient configured

// --- Admin Product API Functions ---

// Fetch all products for admin view (with pagination/search)
export const fetchAdminProducts = async (params = {}) => {
    try {
        // Params like { page: 1, limit: 10, search: 'term' }
        const functionUrl = new URL(import.meta.env.VITE_SUPABASE_GET_ADMIN_PRODUCTS_URL);

        // Append query parameters from the params object
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                functionUrl.searchParams.append(key, params[key]);
            }
        });

        const response = await fetch(functionUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // Assuming you store the access token in localStorage
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, count, totalProducts, totalPages, currentPage, data }
        return data;
    } catch (error) {
        console.error(`Admin API - Error fetching products (Params: ${JSON.stringify(params)}):`, {
            message: error.message,
            status: error.response?.status, // Log status if available
            data: error.response?.data,     // Log data if available
            isNetworkError: !error.response // Check if it might be a network/CORS issue
        });
        throw error.response?.data || new Error(`Failed to fetch products. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Fetch a single product by ID for editing
export const fetchAdminProductById = async (productId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_GET_ADMIN_PRODUCT_DETAIL_URL}?id=${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, data: product }
        return data;
    } catch (error) {
        console.error(`Admin API - Error fetching product ${productId}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to fetch product ${productId}. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Delete a product by ID
export const deleteAdminProduct = async (productId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_DELETE_ADMIN_PRODUCT_URL}?id=${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, message, data: {} }
        return data;
    } catch (error) {
        console.error(`Admin API - Error deleting product ${productId}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to delete product ${productId}. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Create a new product (using Supabase function and Storage API)
export const createAdminProduct = async (formData) => {
    try {
        // 1. Extract NEW image files from formData
        const newImageFiles = formData.getAll('newImages'); // Use 'newImages' field

        // 2. Upload NEW images to Supabase Storage and get relative paths
        const uploadedImagePaths = [];
        for (const imageFile of newImageFiles) {
            const uniqueFileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`; // Ensure unique names
            const { data, error } = await supabase
                .storage
                .from('products') // Your bucket name
                .upload(uniqueFileName, imageFile, {
                    cacheControl: '3600',
                    upsert: false // Don't overwrite existing files with the same name (though unlikely with timestamp)
                });

            if (error) {
                console.error("Error uploading image:", error);
                // Consider cleanup: delete already uploaded images for this product if one fails?
                throw new Error(`Failed to upload image: ${imageFile.name}`);
            }

            if (data?.path) {
                uploadedImagePaths.push(`/${data.path}`); // Store relative path starting with '/'
            } else {
                console.warn("Upload successful but path not found for:", imageFile.name);
                // Handle cases where path might be missing, though unlikely on success
            }
        }

        // 3. Create product data object for the backend function
        const productData = {};
        // Iterate over formData entries and build productData, excluding files
        for (const [key, value] of formData.entries()) {
            if (key !== 'newImages') { // Exclude the file input field itself
                productData[key] = value;
            }
        }
        productData.images = uploadedImagePaths; // Add the array of relative image paths

        // --- Ensure slug is included if required by your DB schema ---
        // If your backend expects a slug, generate it here if not present
        // Also ensure it's not empty or whitespace
        if ((!productData.slug || !String(productData.slug).trim()) && productData.name) {
            productData.slug = String(productData.name)
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric, non-space, non-hyphen
                .trim() // Trim leading/trailing spaces
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single
                .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
        }

        // Defensive: If slug is still missing or empty after generation, throw before sending
        if (!productData.slug || !String(productData.slug).trim()) {
            // Log the name to see why slug generation failed
            console.error("Slug generation failed. Product Name:", productData.name);
            throw new Error('Product slug is required and could not be generated from the name.');
        }

        // --- Add Logging Here ---
        console.log("Sending productData to backend:", JSON.stringify(productData, null, 2));
        // ------------------------

        // 4. Call create-admin-product function
        const response = await fetch(import.meta.env.VITE_SUPABASE_CREATE_ADMIN_PRODUCT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(productData) // Send structured JSON data
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Attempt to delete uploaded images if backend function fails
            if (uploadedImagePaths.length > 0) {
                const pathsToDelete = uploadedImagePaths.map(p => p.substring(1)); // Remove leading '/' for deletion API
                await supabase.storage.from('products').remove(pathsToDelete);
                console.log("Cleaned up uploaded images due to backend error.");
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, data: product }
        return data;
    } catch (error) {
        console.error("Admin API - Error creating product:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw new Error(error.message || `Failed to create product. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Update an existing product (using Supabase function and Storage API)
export const updateAdminProduct = async (productId, formData) => {
    try {
        // 1. Extract data from formData
        const newImageFiles = formData.getAll('newImages');
        const imagesToDelete = JSON.parse(formData.get('imagesToDelete') || '[]'); // Array of relative paths (e.g., /image.jpg)
        const existingImages = JSON.parse(formData.get('images') || '[]'); // Array of existing relative paths to keep

        // 2. Upload NEW images and get relative paths
        const newlyUploadedPaths = [];
        for (const imageFile of newImageFiles) {
            const uniqueFileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
            const { data, error } = await supabase
                .storage
                .from('products')
                .upload(uniqueFileName, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Error uploading image:", error);
                throw new Error(`Failed to upload new image: ${imageFile.name}`);
            }
            if (data?.path) {
                newlyUploadedPaths.push(`/${data.path}`); // Store relative path starting with '/'
            } else {
                console.warn("Upload successful but path not found for:", imageFile.name);
            }
        }

        // 3. Combine existing and new image paths
        const finalImagePaths = [...existingImages, ...newlyUploadedPaths];

        // 4. Create product data object for the backend function
        const productData = {};
        for (const [key, value] of formData.entries()) {
            // Exclude file inputs and image management fields handled separately
            if (!['newImages', 'imagesToDelete', 'images'].includes(key)) {
                productData[key] = value;
            }
        }
        productData.images = finalImagePaths; // Set the final list of relative paths
        productData.imagesToDelete = imagesToDelete; // Pass paths to delete to the backend

        // 5. Call update-admin-product function
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_UPDATE_ADMIN_PRODUCT_URL}?id=${productId}`, {
            method: 'PUT', // Or PATCH depending on your backend function
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // Attempt to delete newly uploaded images if backend function fails
            if (newlyUploadedPaths.length > 0) {
                const pathsToDelete = newlyUploadedPaths.map(p => p.substring(1)); // Remove leading '/'
                await supabase.storage.from('products').remove(pathsToDelete);
                console.log("Cleaned up newly uploaded images due to backend update error.");
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // Note: The backend function should handle deleting the 'imagesToDelete' from storage *after* DB update succeeds.
        // This frontend code assumes the backend will do the deletion.

        const data = await response.json();
        // Expects { success, data: product }
        return data;
    } catch (error) {
        console.error(`Admin API - Error updating product ${productId}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw new Error(error.message || `Failed to update product ${productId}. Status: ${error.response?.status || 'N/A'}`);
    }
};

// --- Admin Category API Functions ---

// Fetch all categories for admin view
export const fetchAdminCategories = async () => {
    try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_GET_ADMIN_CATEGORIES_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, count, data: categories }
        return data;
    } catch (error) {
        console.error("Admin API - Error fetching categories:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to fetch categories. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Fetch single category by ID for editing
export const fetchAdminCategoryById = async (categoryId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_GET_ADMIN_CATEGORY_DETAIL_URL}?id=${categoryId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, data: category }
        return data;
    } catch (error) {
        console.error(`Admin API - Error fetching category ${categoryId}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to fetch category ${categoryId}. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Create a new category
export const createAdminCategory = async (categoryData) => {
    try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_CREATE_ADMIN_CATEGORY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, data: category }
        return data;
    } catch (error) {
        console.error("Admin API - Error creating category:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to create category. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Update an existing category
export const updateAdminCategory = async (categoryId, categoryData) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_UPDATE_ADMIN_CATEGORY_URL}?id=${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(categoryData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, data: category }
        return data;
    } catch (error) {
        console.error(`Admin API - Error updating category ${categoryId}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to update category ${categoryId}. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Delete a category by ID
export const deleteAdminCategory = async (categoryId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_DELETE_ADMIN_CATEGORY_URL}?id=${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, message, data: {} }
        return data;
    } catch (error) {
        console.error(`Admin API - Error deleting category ${categoryId}:`, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to delete category ${categoryId}. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Fetch all users (admin only)
export const fetchAllUsers = async () => {
    try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_GET_USERS_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success: true, data: users[] }
        return data;
    } catch (error) {
        console.error("Admin API - Error fetching users:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to fetch users. Status: ${error.response?.status || 'N/A'}`);
    }
};

// Delete a user (admin only)
export const deleteUserApi = async (userId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_DELETE_USER_URL}?id=${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success: true, message: "User deleted successfully" }
        return data;
    } catch (error) {
        console.error("Admin API - Error deleting user:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            isNetworkError: !error.response
        });
        throw error.response?.data || new Error(`Failed to delete user. Status: ${error.response?.status || 'N/A'}`);
    }
};