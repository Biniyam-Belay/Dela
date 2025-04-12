import apiClient from './apiClient';

// Fetch all products with optional filters/pagination
export const fetchProducts = async (params = {}) => {
  try {
    // Construct the URL for the Supabase Edge Function
    const functionUrl = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-public-products`);

    // Append query parameters from the params object
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        functionUrl.searchParams.append(key, params[key]);
      }
    });

    // Replace apiClient call with direct fetch
    const response = await fetch(functionUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header needed for this public function
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // The function returns { success, count, totalPages, currentPage, data } or { success: false, error }

  } catch (error) {
    console.error("Error fetching products:", error.message);
    // Re-throw a consistent error structure
    throw new Error(error.message || 'Failed to fetch products');
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
    // Replace apiClient call with direct fetch to the Supabase Edge Function
    const response = await fetch('https://exutmsxktrnltvdgnlop.supabase.co/functions/v1/get-public-categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header needed for this public function
      },
    });

    if (!response.ok) {
      // Attempt to parse error from Supabase function response
      const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON error response
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // The function returns { success, count, data } or { success: false, error }
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    // Re-throw a consistent error structure
    throw new Error(error.message || 'Failed to fetch categories');
  }
};

// Add createProduct, updateProduct etc. later