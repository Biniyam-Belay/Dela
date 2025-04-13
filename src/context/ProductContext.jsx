import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'; // Added useCallback
import api, {
    fetchProducts as apiFetchProducts,
    fetchProductById as apiFetchProductById, // Import the specific API call
    createProduct as apiCreateProduct
    /* other product api calls */
} from '../services/api';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // State for single product view
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false); // Separate loading for single product
  const [error, setError] = useState(null);
  const [productError, setProductError] = useState(null); // Separate error for single product
  const [pagination, setPagination] = useState({});

  // Use useCallback to memoize fetchProducts if it's passed as a dependency elsewhere
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchProducts(params);
      if (response.data && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setPagination({
              totalPages: response.data.totalPages,
              currentPage: response.data.currentPage,
              totalProducts: response.data.totalProducts,
          });
      } else if (Array.isArray(response.data)) {
          setProducts(response.data);
          setPagination({});
      } else {
          console.warn("Unexpected product data format:", response.data);
          setProducts([]);
          setPagination({});
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
      console.error("Fetch products error:", err);
      setError(errorMessage);
      setProducts([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  // Function to fetch a single product by ID
  const fetchProductById = useCallback(async (id) => {
    console.log(`[ProductContext] Fetching product with ID: ${id}`);
    setProductLoading(true);
    setProductError(null);
    setSelectedProduct(null); // Clear previous product
    try {
      const response = await apiFetchProductById(id);
      console.log('[ProductContext] API Response for product:', response);
      if (response.data) {
        console.log('[ProductContext] Setting selected product:', response.data);
        setSelectedProduct(response.data);
      } else {
         console.error('[ProductContext] No data received for product ID:', id);
         throw new Error('Product data not found in response');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || `Failed to fetch product with ID ${id}`;
      console.error("[ProductContext] Fetch product by ID error:", errorMessage, err.response || err);
      setProductError(errorMessage);
      setSelectedProduct(null);
    } finally {
      console.log('[ProductContext] Finished fetching product. Loading:', false);
      setProductLoading(false);
    }
  }, []); // Empty dependency array

   // Example: Add Product function
   const addProduct = async (productData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateProduct(productData);
      // Optionally refetch products or add the new one to the state
      // fetchProducts(); // Easiest way to update list
      setProducts(prev => [...prev, response.data]); // Or just add if response contains the new product
      setLoading(false);
      return response.data; // Return new product data
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add product';
      console.error("Add product error:", err);
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage); // Re-throw for component handling
    }
  };

  // Add other functions like updateProduct, deleteProduct

  const value = {
    products,
    selectedProduct, // Provide selected product
    loading,
    productLoading, // Provide single product loading state
    error,
    productError, // Provide single product error state
    pagination,
    fetchProducts,
    fetchProductById, // Provide the new function
    addProduct,
    // add other functions here
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

// Custom hook
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
