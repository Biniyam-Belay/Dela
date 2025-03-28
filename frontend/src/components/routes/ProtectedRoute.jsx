import React from 'react';
import { useAuth } from '../../contexts/authContext.jsx';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../common/Spinner'; // Reuse spinner for loading state

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation(); // Get current location to redirect back after login

  if (isLoading) {
    // Show a loading indicator while checking authentication status
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated, redirect to the login page
    // Pass the current location in state so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child components
  return children;
};

export default ProtectedRoute;