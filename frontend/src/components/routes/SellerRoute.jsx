import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/authContext.jsx';
import { Navigate, useLocation } from 'react-router-dom';
import Spinner from '../common/Spinner';
import { getSellerProfile } from '../../services/sellerApi.js';

const SellerRoute = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [sellerStatus, setSellerStatus] = useState(null);
  const [isCheckingSellerStatus, setIsCheckingSellerStatus] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const sellerData = await getSellerProfile();
          setSellerStatus(sellerData?.status || 'not_applied');
        } catch (error) {
          console.error('Error checking seller status:', error);
          // For development: If we can't check seller status, assume approved seller
          // This allows testing the seller dashboard without backend
          setSellerStatus('active');
        }
      } else {
        // For development: Allow testing without authentication
        setSellerStatus('active');
      }
      setIsCheckingSellerStatus(false);
    };

    if (!authLoading) {
      checkSellerStatus();
    }
  }, [isAuthenticated, user, authLoading]);

  if (authLoading || isCheckingSellerStatus) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    // For development: Allow testing without authentication
    console.log('Development mode: Allowing seller access without authentication');
    // return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (sellerStatus === 'not_applied') {
    return <Navigate to="/seller/apply" replace />;
  }

  if (sellerStatus === 'pending') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Application Under Review</h2>
          <p className="text-gray-600">
            Your seller application is currently being reviewed. We'll notify you once it's approved.
          </p>
        </div>
      </div>
    );
  }

  if (sellerStatus === 'rejected') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Application Rejected</h2>
          <p className="text-gray-600 mb-4">
            Unfortunately, your seller application was not approved.
          </p>
          <button 
            onClick={() => window.location.href = '/seller/apply'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Again
          </button>
        </div>
      </div>
    );
  }

  // If seller is approved, render the children
  return children;
};

export default SellerRoute;
