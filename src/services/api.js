import axios from 'axios';

// Define the base URL for the API
// Replace with your actual backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; // Example URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally if needed (e.g., redirect on 401)
    if (error.response && error.response.status === 401) {
      // Example: Unauthorized, potentially redirect to login
      console.error("Unauthorized access - Redirecting to login might be needed");
      // localStorage.removeItem('token');
      // localStorage.removeItem('user');
      // window.location.href = '/login'; // Consider using useNavigate hook instead
    }
    return Promise.reject(error);
  }
);

export default api;

// Define specific API functions (examples)

// Auth
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginAdmin = (credentials) => api.post('/auth/admin/login', credentials);
export const fetchUserProfile = () => api.get('/users/profile'); // Example endpoint
export const updateUserProfile = (profileData) => api.put('/users/profile', profileData); // Example endpoint

// Products
export const fetchProducts = (params) => api.get('/products', { params });
export const fetchProductById = (id) => api.get(`/products/${id}`); // Ensure this line exists and is correct
export const createProduct = (productData) => api.post('/products', productData);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Categories
export const fetchCategories = () => api.get('/categories');
export const createCategory = (categoryData) => api.post('/categories', categoryData);
export const updateCategory = (id, categoryData) => api.put(`/categories/${id}`, categoryData);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Orders
export const createOrder = (orderData) => api.post('/orders', orderData);
export const fetchUserOrders = () => api.get('/orders/my-orders'); // Example for user's orders
export const fetchAllOrders = () => api.get('/orders'); // Example for admin
export const fetchOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, statusData) => api.put(`/orders/${id}/status`, statusData); // Example

// Cart (Assuming cart is managed client-side, but maybe sync/fetch)
// export const fetchCart = () => api.get('/cart'); // If cart is stored server-side
// export const updateCart = (cartData) => api.post('/cart', cartData); // If cart is stored server-side

// Users (Admin)
export const fetchUsers = () => api.get('/users'); // Example for admin
export const getUserById = (id) => api.get(`/users/${id}`); // Example for admin
export const updateUserRole = (id, roleData) => api.put(`/users/${id}/role`, roleData); // Example for admin
export const deleteUser = (id) => api.delete(`/users/${id}`); // Example for admin
