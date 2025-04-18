// Explicitly import from apiClient.jsx
import { apiClient } from './apiClient.jsx';
// Remove direct supabase import if no longer needed elsewhere in this file
// import { supabase } from '../utils/supabaseClient.js';

// --- Categories ---
export const fetchAdminCategories = async () => {
  return apiClient.get('/admin/categories');
};

export const fetchAdminCategoryById = async (categoryId) => {
  return apiClient.get(`/admin/categories/${categoryId}`);
};

export const createAdminCategory = async (categoryData) => {
  // Handle potential FormData for image upload if needed, or send JSON
  return apiClient.post('/admin/categories', categoryData);
};

export const updateAdminCategory = async (categoryId, categoryData) => {
  // Handle potential FormData for image upload if needed, or send JSON
  return apiClient.put(`/admin/categories/${categoryId}`, categoryData);
};

export const deleteAdminCategory = async (categoryId) => {
  return apiClient.delete(`/admin/categories/${categoryId}`);
};

// --- Products ---
export const fetchAdminProducts = async (params = {}) => {
  // params could include { page, limit, search, categoryId, sortBy, sortOrder }
  return apiClient.get('/admin/products', { params });
};

export const fetchAdminProductById = async (productId) => {
  return apiClient.get(`/admin/products/${productId}`);
};

export const createAdminProduct = async (productFormData) => {
  // Expecting FormData due to image uploads
  return apiClient.post('/admin/products', productFormData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateAdminProduct = async (productId, productFormData) => {
  // Expecting FormData due to image uploads
  // Use POST with _method=PUT if backend expects it for FormData PUT
  return apiClient.post(`/admin/products/${productId}`, productFormData, {
     headers: {
       'Content-Type': 'multipart/form-data',
     },
     params: { // Or include _method in FormData if preferred
        _method: 'PUT'
     }
  });
  // Or if backend supports PUT with FormData directly:
  // return apiClient.put(`/admin/products/${productId}`, productFormData, {
  //   headers: {
  //     'Content-Type': 'multipart/form-data',
  //   },
  // });
};

export const deleteAdminProduct = async (productId) => {
  return apiClient.delete(`/admin/products/${productId}`);
};

// --- Orders (Use Actual API) ---
export const fetchAdminOrders = async (params = {}) => {
  // params could include { page, limit, search, status, userId, dateFrom, dateTo }
  console.log("Fetching orders with params:", params); // Keep log for debugging
  // Use actual API call
  return apiClient.get('/admin/orders', { params });
};

// --- Users (Fetch via Edge Function) ---
export const fetchAdminUsers = async (params = {}) => {
  console.log("Fetching users via Edge Function with params:", params);

  // Use the specific environment variable for the function URL
  const functionUrl = import.meta.env.VITE_SUPABASE_ADMIN_GET_USERS_URL;

  if (!functionUrl) {
    console.error("Error: VITE_SUPABASE_ADMIN_GET_USERS_URL is not defined in .env file.");
    throw new Error("Admin users function URL is not configured.");
  }

  console.log("Calling function URL:", functionUrl);

  try {
    // Use apiClient but provide the full URL to override the default baseURL
    const response = await apiClient.get(functionUrl, { params });

    // The Edge function should return data in the format { users: [], totalPages: N, totalUsers: M }
    return {
        data: response.data // Assuming axios automatically parses JSON
    };

  } catch (error) {
    console.error(`Error calling Edge function at ${functionUrl}:`, error);
    // Add more specific logging for network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error(`Connection refused or network issue. Is the function deployed and accessible at ${functionUrl}?`);
    }
    // Re-throw the error so the component's catch block can handle it
    throw error;
  }
};

// Add other admin API functions as needed (e.g., fetchDashboardStats, updateSettings)
