import React from 'react';
import { useAuth } from '../contexts/authContext.jsx';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiAward, FiCalendar, FiLogOut, FiShoppingBag, FiMapPin } from 'react-icons/fi';
import { Helmet } from 'react-helmet';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-0 pt-32">
      <Helmet>
        <title>Profile | SuriAddis</title>
        <meta name="description" content="Manage your profile, update your information, and view your account details on SuriAddis." />
      </Helmet>
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="mx-auto h-20 w-20 rounded-full bg-black flex items-center justify-center mb-5 shadow border-4 border-white">
            <span className="text-2xl font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h1 className="text-2xl font-sans font-semibold text-black mb-1 tracking-tight">{user.name}</h1>
          <p className="text-neutral-400 text-base font-light">{user.email}</p>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-xl shadow border border-black/10 overflow-hidden">
          {/* Detail Sections */}
          <div className="border-b border-black/10 p-6">
            <h2 className="text-lg font-sans font-semibold text-black mb-6 flex items-center gap-2">
              <FiUser className="text-black" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <FiMail className="h-5 w-5 text-black mt-1" />
                <div>
                  <p className="text-sm text-neutral-400 font-light">Email</p>
                  <p className="text-black font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiAward className="h-5 w-5 text-black mt-1" />
                <div>
                  <p className="text-sm text-neutral-400 font-light">Account Type</p>
                  <p className="text-black font-medium capitalize">{user.role || 'standard'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiCalendar className="h-5 w-5 text-black mt-1" />
                <div>
                  <p className="text-sm text-neutral-400 font-light">Member Since</p>
                  <p className="text-black font-medium">
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
          <div className="p-6 bg-white">
            <h2 className="text-lg font-sans font-semibold text-black mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/orders"
                className="flex items-center justify-between p-4 border border-black/10 rounded-lg bg-white hover:border-black hover:bg-black/5 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <FiShoppingBag className="text-black mr-3" />
                  <span className="font-medium text-black group-hover:text-black">Order History</span>
                </div>
                <span className="text-black">→</span>
              </Link>
              <Link
                to="/addresses"
                className="flex items-center justify-between p-4 border border-black/10 rounded-lg bg-white hover:border-black hover:bg-black/5 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <FiMapPin className="text-black mr-3" />
                  <span className="font-medium text-black group-hover:text-black">Saved Addresses</span>
                </div>
                <span className="text-black">→</span>
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-6 bg-white border-t border-black/10">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-6 py-3 border border-black text-base font-semibold rounded-full text-white bg-black hover:bg-white hover:text-black transition-all duration-200 shadow"
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