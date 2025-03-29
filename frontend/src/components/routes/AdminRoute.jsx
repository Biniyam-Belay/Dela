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

  if (user?.role !== 'ADMIN') {
    // Logged in, but not an ADMIN - redirect to home or an unauthorized page
    console.warn("Access denied: User is not an admin.");
    // You could create a dedicated Unauthorized page later
    return <Navigate to="/" replace />;
  }

  // Authenticated and is an ADMIN, render the child components (the admin page)
  return children;
};

export default AdminRoute;