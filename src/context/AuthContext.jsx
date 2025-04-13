import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { loginUser as apiLoginUser, loginAdmin as apiAdminLogin } from '../services/api';
import { useNavigate } from 'react-router-dom'; // Import if needed for redirects within context

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Track initial loading state
  const [error, setError] = useState(null);

  // Check for token and user data in localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Check if the user has an admin role (adjust based on your user object structure)
        if (parsedUser.role === 'admin') {
          setIsAdmin(true);
        }
        // You might want to verify the token with the backend here
        // e.g., fetchUserProfile().then(...).catch(logout)
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false); // Finished initial check
  }, []);

  const handleLoginSuccess = (data) => {
    // Destructure carefully, ensure 'token' and 'user' exist in the response data
    const receivedToken = data?.token;
    const userData = data?.user;

    // Validate that we received the expected data
    if (!receivedToken || !userData) {
        console.error("Login success handler received invalid data:", data);
        // Set error state or throw an error to be caught by login functions
        setError("Login failed: Invalid response data from server.");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setIsAdmin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null; // Indicate failure
    }

    console.log("Login successful, received token:", receivedToken);
    console.log("Login successful, received user:", userData);

    localStorage.setItem('token', receivedToken);
    // Ensure user data is stringified before storing
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(receivedToken);
    setUser(userData);
    setIsAuthenticated(true);
    setError(null); // Clear previous errors

    // Check role AFTER confirming userData is valid
    if (userData.role === 'admin') {
      console.log("User is admin");
      setIsAdmin(true);
      return 'admin'; // Indicate admin login for redirection
    } else {
      console.log("User is not admin");
      setIsAdmin(false);
      return 'user'; // Indicate user login for redirection
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting user login with:", credentials.email);
      const response = await apiLoginUser(credentials);
      console.log("User login API response:", response);
      // Pass the entire response.data to the handler
      const loginType = handleLoginSuccess(response.data);
      if (!loginType) {
          // handleLoginSuccess indicated an issue with the response data
          throw new Error(error || 'Login failed due to invalid server response.');
      }
      setLoading(false);
      return loginType;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during login.';
      console.error("Login error:", errorMessage, err.response || err);
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setIsAdmin(false);
      setLoading(false);
      throw new Error(errorMessage); // Re-throw error
    }
  };

  const adminLogin = async (credentials) => {
     setLoading(true);
     setError(null);
    try {
      console.log("Attempting admin login with:", credentials.email);
      const response = await apiAdminLogin(credentials);
      console.log("Admin login API response:", response);
      // Pass the entire response.data to the handler
      const loginType = handleLoginSuccess(response.data);
       if (!loginType || loginType !== 'admin') {
          // handleLoginSuccess indicated an issue or user wasn't admin
           const message = loginType === 'user' ? 'Login successful, but user is not an admin.' : (error || 'Admin login failed due to invalid server response.');
           setError(message);
           // Log out if partially logged in as non-admin
           if (loginType === 'user') logout();
           throw new Error(message);
       }
      setLoading(false);
      return loginType; // Should be 'admin'
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during admin login.';
      console.error("Admin login error:", errorMessage, err.response || err);
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setIsAdmin(false);
      setLoading(false);
      throw new Error(errorMessage); // Re-throw error
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setError(null);
    // Optionally redirect using useNavigate or window.location
    // navigate('/login'); // If using useNavigate hook
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isAdmin,
    loading, // Provide loading state for initial auth check
    error, // Provide error state
    login,
    adminLogin,
    logout,
    setUser, // Allow updating user profile info if needed elsewhere
  };

  // Don't render children until initial auth check is complete
  // Or show a loading spinner
  // if (loading) {
  //   return <div>Loading authentication...</div>;
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
