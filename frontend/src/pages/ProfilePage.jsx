import React from 'react';
import { useAuth } from '../contexts/authContext.jsx';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiAward, FiCalendar, FiLogOut, FiShoppingBag, FiMapPin } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Detail Sections */}
          <div className="border-b border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiUser className="mr-2 text-indigo-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-gray-400 mt-1 mr-3">
                  <FiMail />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-gray-400 mt-1 mr-3">
                  <FiAward />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="text-gray-900 capitalize">{user.role || 'standard'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-gray-400 mt-1 mr-3">
                  <FiCalendar />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/orders"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <FiShoppingBag className="text-indigo-600 mr-3" />
                  <span>Order History</span>
                </div>
                <span className="text-indigo-600">→</span>
              </Link>
              <Link
                to="/addresses"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <FiMapPin className="text-indigo-600 mr-3" />
                  <span>Saved Addresses</span>
                </div>
                <span className="text-indigo-600">→</span>
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-6 bg-gray-50">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
            >
              <FiLogOut className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;