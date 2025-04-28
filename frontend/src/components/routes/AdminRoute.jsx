import React from 'react';
import { useAuth } from '../../contexts/authContext.jsx'
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../common/Spinner.jsx';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading indicator while auth status is being checked
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check app_metadata for the role assigned in Supabase Auth UI
  // Make sure the key ('user_role' here) matches what you set in the metadata
  if (user?.app_metadata?.user_role !== 'ADMIN') { // This check is correct
    console.warn("Access denied: User does not have ADMIN role in app_metadata.");
    return <Navigate to="/" replace />;
  }

  // Authenticated and is an ADMIN, render the child components (the admin page)
  return children;
};

export default AdminRoute;