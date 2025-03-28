import axios from 'axios';

// Get the backend URL from environment variables
// Vite exposes env vars prefixed with VITE_
// Make sure to create a .env file in the 'frontend' directory
// Example .env content: VITE_API_BASE_URL=http://localhost:5000/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// You might add interceptors here later for handling auth tokens or errors globally
// apiClient.interceptors.request.use(config => { ... });
// apiClient.interceptors.response.use(response => response, error => { ... });

export default apiClient;