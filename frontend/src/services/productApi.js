import apiClient from './apiClient';

// Fetch all products with optional filters/pagination
export const fetchProducts = async (params = {}) => {
  try {
    // params could be like { page: 1, limit: 10, category: 'electronics', search: 'laptop' }
    const response = await apiClient.get('/products', { params });
    return response.data; // The backend returns { success, count, totalPages, currentPage, data }
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message);
    // Re-throw or return a specific error structure
    throw error.response?.data || new Error('Failed to fetch products');
  }
};

// Fetch a single product by its slug or ID
export const fetchProductByIdentifier = async (identifier) => {
  try {
    const response = await apiClient.get(`/products/${identifier}`);
    return response.data; // The backend returns { success, data }
  } catch (error) {
    console.error(`Error fetching product ${identifier}:`, error.response?.data || error.message);
    throw error.response?.data || new Error(`Failed to fetch product ${identifier}`);
  }
};

// Fetch all categories (add this here or create categoryApi.js)
export const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data; // The backend returns { success, count, data }
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
      throw error.response?.data || new Error('Failed to fetch categories');
    }
  };

// Add createProduct, updateProduct etc. later