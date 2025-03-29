import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiList, FiPackage, FiUsers, FiShoppingBag, FiDollarSign } from 'react-icons/fi';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to the SuriAddis Admin Panel</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Products */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">Loading...</h3>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <FiShoppingBag className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">Loading...</h3>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <FiPackage className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">Loading...</h3>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <FiUsers className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">Loading...</h3>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <FiDollarSign className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-light text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/products/new"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-black transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-black text-white p-3 rounded-lg group-hover:bg-gray-800 transition-colors">
                  <FiPlus size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Add New Product</h3>
                  <p className="text-sm text-gray-500">Create a new product listing</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-black transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-black text-white p-3 rounded-lg group-hover:bg-gray-800 transition-colors">
                  <FiList size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Manage Categories</h3>
                  <p className="text-sm text-gray-500">Organize product categories</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-black transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-black text-white p-3 rounded-lg group-hover:bg-gray-800 transition-colors">
                  <FiPackage size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Orders</h3>
                  <p className="text-sm text-gray-500">Manage customer orders</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-light text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <FiUsers className="text-gray-600" size={16} />
                </div>
                <p className="text-gray-600">New user registered</p>
              </div>
              <span className="text-sm text-gray-400">2 min ago</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <FiShoppingBag className="text-gray-600" size={16} />
                </div>
                <p className="text-gray-600">New order received</p>
              </div>
              <span className="text-sm text-gray-400">15 min ago</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <FiPlus className="text-gray-600" size={16} />
                </div>
                <p className="text-gray-600">New product added</p>
              </div>
              <span className="text-sm text-gray-400">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;