import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// allowedRoles: An array of roles allowed to access the route (e.g., ['admin'], ['user'], ['admin', 'user'])
const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // 1. Handle Loading State (Optional but recommended)
  // Wait until the initial authentication check is complete
  if (loading) {
    // You can return a loading spinner or null
    return <div>Loading...</div>; // Or your custom loading component
  }

  // 2. Check Authentication
  if (!isAuthenticated) {
    // Redirect them to the login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    // Determine redirect path based on whether it's an admin route attempt
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 3. Check Authorization (Role)
  // Ensure allowedRoles is an array
  const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [];

  // If roles are specified, check if the user's role is included
  // Adjust 'user.role' based on your actual user object structure
  const userRole = user?.role; // e.g., 'user' or 'admin'

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(userRole)) {
      // User is authenticated but does not have the required role
      // Redirect to a 'Forbidden' page or back to a safe page (e.g., home)
      // Or maybe to the specific login page if roles mismatch drastically (e.g., user trying admin)
      console.warn(`Access denied for role: ${userRole}. Required: ${rolesToCheck.join(', ')}`);
      // Redirect to home or a specific 'unauthorized' page
      // If an admin is required, maybe redirect non-admins trying admin routes to home?
      if (rolesToCheck.includes('admin') && userRole !== 'admin') {
          return <Navigate to="/" state={{ from: location }} replace />; // Or to user dashboard
      }
      // If a user is required, maybe redirect admins trying user-only routes to admin dash?
      if (rolesToCheck.includes('user') && userRole === 'admin') {
          return <Navigate to="/admin/dashboard" state={{ from: location }} replace />;
      }
      // General fallback if role mismatch
      return <Navigate to="/" state={{ from: location }} replace />; // Or an "Access Denied" component
  }


  // 4. User is Authenticated and Authorized: Render the child component (<Outlet /> for nested routes)
  return <Outlet />;
};

export default PrivateRoute;
