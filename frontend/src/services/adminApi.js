import apiClient from './apiClient'; // Assumes apiClient includes auth token

// --- Admin Product API Functions ---

// Fetch all products for admin view (with pagination/search)
export const fetchAdminProducts = async (params = {}) => {
    try {
        // Params like { page: 1, limit: 10, search: 'term' }
        const response = await apiClient.get('/admin/products', { params });
        // Expects { success, count, totalProducts, totalPages, currentPage, data }
        return response.data;
    } catch (error) {
        console.error("Admin API - Error fetching products:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch products');
    }
};

// Fetch a single product by ID for editing
export const fetchAdminProductById = async (productId) => {
    try {
        const response = await apiClient.get(`/admin/products/${productId}`);
        // Expects { success, data: product }
        return response.data;
    } catch (error) {
        console.error(`Admin API - Error fetching product ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch product ${productId}`);
    }
};

// Delete a product by ID
export const deleteAdminProduct = async (productId) => {
    try {
        const response = await apiClient.delete(`/admin/products/${productId}`);
        // Expects { success, message, data: {} }
        return response.data;
    } catch (error) {
        console.error(`Admin API - Error deleting product ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to delete product ${productId}`);
    }
};

// Create a new product (using FormData for images)
export const createAdminProduct = async (formData) => {
    try {
        const response = await apiClient.post('/admin/products', formData, {
            headers: {
                // Let Axios/browser set Content-Type for multipart/form-data
                'Content-Type': 'multipart/form-data',
            },
        });
        // Expects { success, data: product }
        return response.data;
    } catch (error) {
        console.error("Admin API - Error creating product:", error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to create product');
    }
};

// Update an existing product (using FormData for images)
export const updateAdminProduct = async (productId, formData) => {
    try {
        const response = await apiClient.put(`/admin/products/${productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // Expects { success, data: product }
        return response.data;
    } catch (error) {
        console.error(`Admin API - Error updating product ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to update product ${productId}`);
    }
};


// --- Admin Category API Functions ---

// Fetch all categories for admin view
export const fetchAdminCategories = async () => {
    try {
       const response = await apiClient.get('/admin/categories'); // GET to admin endpoint
       // Expects { success, count, data: categories }
       return response.data;
   } catch (error) {
       console.error("Admin API - Error fetching categories:", error.response?.data || error.message);
       throw error.response?.data || new Error('Failed to fetch categories');
   }
};

// Fetch single category by ID for editing
export const fetchAdminCategoryById = async (categoryId) => {
    try {
       const response = await apiClient.get(`/admin/categories/${categoryId}`);
       // Expects { success, data: category }
       return response.data;
   } catch (error) {
       console.error(`Admin API - Error fetching category ${categoryId}:`, error.response?.data || error.message);
       throw error.response?.data || new Error(`Failed to fetch category ${categoryId}`);
   }
};


// Create a new category
export const createAdminCategory = async (categoryData) => {
   // categoryData = { name, description? }
    try {
       const response = await apiClient.post('/admin/categories', categoryData);
       // Expects { success, data: category }
       return response.data;
   } catch (error) {
       console.error("Admin API - Error creating category:", error.response?.data || error.message);
       throw error.response?.data || new Error('Failed to create category');
   }
};

// Update an existing category
export const updateAdminCategory = async (categoryId, categoryData) => {
    // categoryData = { name?, description? }
    try {
       const response = await apiClient.put(`/admin/categories/${categoryId}`, categoryData);
        // Expects { success, data: category }
       return response.data;
   } catch (error) {
       console.error(`Admin API - Error updating category ${categoryId}:`, error.response?.data || error.message);
       throw error.response?.data || new Error(`Failed to update category ${categoryId}`);
   }
};

// Delete a category by ID
export const deleteAdminCategory = async (categoryId) => {
    try {
       const response = await apiClient.delete(`/admin/categories/${categoryId}`);
       // Expects { success, message, data: {} }
       return response.data;
   } catch (error) {
       console.error(`Admin API - Error deleting category ${categoryId}:`, error.response?.data || error.message);
       throw error.response?.data || new Error(`Failed to delete category ${categoryId}`);
   }
};