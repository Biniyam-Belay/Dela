import apiClient from './apiClient'; // Assumes apiClient includes auth token
import { supabase } from '../utils/supabaseClient.js'; // Assuming you have a supabaseClient configured

// --- Admin Product API Functions ---

// Fetch all products for admin view (with pagination/search)
export const fetchAdminProducts = async (params = {}) => {
    try {
        // Params like { page: 1, limit: 10, search: 'term' }
        const functionUrl = new URL('https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/get-admin-products');

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
        console.error("Admin API - Error fetching products:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch products');
    }
};

// Fetch a single product by ID for editing
export const fetchAdminProductById = async (productId) => {
    try {
        const response = await fetch(`https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/get-admin-product-detail?id=${productId}`, {
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
        console.error(`Admin API - Error fetching product ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch product ${productId}`);
    }
};

// Delete a product by ID
export const deleteAdminProduct = async (productId) => {
    try {
        const response = await fetch(`https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/delete-admin-product?id=${productId}`, {
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
        console.error(`Admin API - Error deleting product ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to delete product ${productId}`);
    }
};

// Create a new product (using Supabase function and Storage API)
export const createAdminProduct = async (formData) => {
    try {
        // 1. Extract image files from formData
        const imageFiles = formData.getAll('images'); // Assuming the field name is 'images'

        // 2. Upload images to Supabase Storage
        const imageUrls = [];
        for (const imageFile of imageFiles) {
            const { data, error } = await supabase
                .storage
                .from('products') // Replace 'products' with your bucket name
                .upload(`${Date.now()}-${imageFile.name}`, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Error uploading image:", error);
                throw new Error('Failed to upload image');
            }

            imageUrls.push(supabase.storage.from('products').getPublicUrl(data.path).data.publicUrl);
        }

        // 3. Create product data object
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: formData.get('price'),
            stockQuantity: formData.get('stockQuantity'),
            categoryId: formData.get('categoryId'),
            images: imageUrls, // Add image URLs to the product data
            // Add other product fields here
        };

        // 4. Call create-admin-product function
        const response = await fetch('https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/create-admin-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, data: product }
        return data;
    } catch (error) {
        console.error("Admin API - Error creating product:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create product');
    }
};

// Update an existing product (using Supabase function and Storage API)
export const updateAdminProduct = async (productId, formData) => {
    try {
        // 1. Extract image files from formData
        const imageFiles = formData.getAll('images'); // Assuming the field name is 'images'

        // 2. Upload images to Supabase Storage
        const imageUrls = [];
        for (const imageFile of imageFiles) {
            const { data, error } = await supabase
                .storage
                .from('products') // Replace 'products' with your bucket name
                .upload(`${Date.now()}-${imageFile.name}`, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("Error uploading image:", error);
                throw new Error('Failed to upload image');
            }

            imageUrls.push(supabase.storage.from('products').getPublicUrl(data.path).data.publicUrl);
        }

        // 3. Create product data object
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: formData.get('price'),
            stockQuantity: formData.get('stockQuantity'),
            categoryId: formData.get('categoryId'),
            images: imageUrls, // Add image URLs to the product data
            // Add other product fields here
        };

        // 4. Call update-admin-product function
        const response = await fetch(`https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/update-admin-product?id=${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Expects { success, data: product }
        return data;
    } catch (error) {
        console.error(`Admin API - Error updating product ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to update product ${productId}`);
    }
};


// --- Admin Category API Functions ---

// Fetch all categories for admin view
export const fetchAdminCategories = async () => {
    try {
        const response = await fetch('https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/get-admin-categories', {
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
        console.error("Admin API - Error fetching categories:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch categories');
    }
};

// Fetch single category by ID for editing
export const fetchAdminCategoryById = async (categoryId) => {
    try {
        const response = await fetch(`https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/get-admin-category-detail?id=${categoryId}`, {
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
        console.error(`Admin API - Error fetching category ${categoryId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch category ${categoryId}`);
    }
};

// Create a new category
export const createAdminCategory = async (categoryData) => {
    try {
        const response = await fetch('https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/create-admin-category', {
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
        console.error("Admin API - Error creating category:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create category');
    }
};

// Update an existing category
export const updateAdminCategory = async (categoryId, categoryData) => {
    try {
        const response = await fetch(`https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/update-admin-category?id=${categoryId}`, {
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
        console.error(`Admin API - Error updating category ${categoryId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to update category ${categoryId}`);
    }
};

// Delete a category by ID
export const deleteAdminCategory = async (categoryId) => {
    try {
        const response = await fetch(`https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/delete-admin-category?id=${categoryId}`, {
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
        console.error(`Admin API - Error deleting category ${categoryId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to delete category ${categoryId}`);
    }
};

// Fetch all users (admin only)
export const fetchAllUsers = async () => {
    try {
        const response = await fetch('https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/get-users', {
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
        console.error("Admin API - Error fetching users:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch users');
    }
};

// Delete a user (admin only)
export const deleteUserApi = async (userId) => {
    try {
        const response = await fetch(`https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/delete-user?id=${userId}`, {
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
        console.error("Admin API - Error deleting user:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete user');
    }
};