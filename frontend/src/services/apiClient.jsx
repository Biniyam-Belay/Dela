import axios from 'axios';
import { supabase } from '../utils/supabaseClient'; // Assuming supabase is used for auth token

// Define the base URL for your API - **VERIFY THIS IS CORRECT**
// Is your backend running on localhost:8000? Does it require '/api'?
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api';

// Create an Axios instance
const apiClientInstance = axios.create({
  baseURL: API_BASE_URL, // Ensure this is the correct base for your backend endpoints
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Supabase Auth token
apiClientInstance.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Add API Key if required by your backend
    // config.headers['X-API-Key'] = import.meta.env.VITE_API_KEY;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling common errors (optional)
apiClientInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Handle common errors like 401 Unauthorized, 403 Forbidden, etc.
    if (error.response?.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - 401");
      // Potentially trigger logout or redirect here
    }
    return Promise.reject(error);
  }
);

// Export the configured instance
export const apiClient = apiClientInstance;
