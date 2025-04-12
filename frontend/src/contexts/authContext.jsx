import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient'; // Your configured axios instance
import { jwtDecode } from 'jwt-decode'; // Install jwt-decode: npm install jwt-decode

// Create the context
const AuthContext = createContext(null);

// Function to check if a token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        return decoded.exp < currentTime;
    } catch (error) {
        console.error("Error decoding token:", error);
        return true; // Treat decoding errors as expired/invalid
    }
};


// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Holds user data { id, name, email, role }
  const [token, setToken] = useState(() => localStorage.getItem('authToken')); // Initialize token from localStorage
  const [loading, setLoading] = useState(true); // Initial loading state for checking token
  const [error, setError] = useState(null); // Authentication errors

  // Function to set the token in state and localStorage
  const saveToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // Set default header for apiClient
    } else {
      localStorage.removeItem('authToken');
      setToken(null);
      delete apiClient.defaults.headers.common['Authorization']; // Remove default header
    }
  }, []);

  // Function to fetch user data based on token
  const fetchUser = useCallback(async () => {
    if (token && !isTokenExpired(token)) {
      setLoading(true);
      try {
        const response = await fetch(import.meta.env.VITE_SUPABASE_GET_USER_PROFILE_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
        });
        const data = await response.json();
        setUser(data); // Assuming Supabase function returns user data
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
        saveToken(null); // Clear invalid token
        setError(err.message || 'Failed to verify session.');
      } finally {
        setLoading(false);
      }
    } else {
      // If no token or token expired
      setUser(null);
      saveToken(null); // Ensure local storage and state are clear
      setLoading(false);
    }
  }, [token, saveToken]);

  // Effect to check token and fetch user on initial load or when token changes externally
  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // Dependency on fetchUser ensures it runs when token changes via saveToken


  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      // Assuming backend returns { success: true, token: '...', user: {...} }
      saveToken(response.data.token);
      setUser(response.data.user);
      return true; // Indicate success
    } catch (err) {
      console.error("Login failed:", err);
      setUser(null);
      saveToken(null);
      const errorMessage = err.response?.data?.error || 'Login failed. Please check credentials.';
      setError(errorMessage);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      // Assuming backend returns { success: true, token: '...', user: {...} }
      saveToken(response.data.token);
      setUser(response.data.user);
      return true; // Indicate success
    } catch (err) {
      console.error("Registration failed:", err);
      setUser(null);
      saveToken(null);
       const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
       setError(errorMessage);
      return false; // Indicate failure
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    saveToken(null); // Clears token from state, localStorage, and apiClient headers
    setError(null);
    // Optionally redirect to home page or login page
    // navigate('/'); // Requires useNavigate hook, might be better handled in components
  };

  // Value provided by the context
  const contextValue = {
    user,
    token,
    isAuthenticated: !!user, // True if user object exists
    isLoading: loading,
    error,
    login,
    register,
    logout,
    clearError: () => setError(null) // Function to clear error message
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};