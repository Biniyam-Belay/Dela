import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  FiGrid, 
  FiBox, 
  FiTag, 
  FiUsers, 
  FiShoppingBag, 
  FiLogOut,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../contexts/authContext.jsx';

const AdminLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Dark Version */}
      <aside className="w-64 bg-gray-900 text-gray-300 p-6 fixed h-full border-r border-gray-800 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-light text-white mb-1">Admin Panel</h2>
          <p className="text-xs text-gray-500">SuriAddis Management</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 mb-8">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-black text-white font-medium' 
                  : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <FiGrid className="mr-3" size={18} />
            Dashboard
          </NavLink>
          
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-black text-white font-medium' 
                  : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <FiBox className="mr-3" size={18} />
            Products
          </NavLink>
          
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-black text-white font-medium' 
                  : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <FiTag className="mr-3" size={18} />
            Categories
          </NavLink>
          
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-black text-white font-medium' 
                  : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <FiShoppingBag className="mr-3" size={18} />
            Orders
          </NavLink>
          
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-black text-white font-medium' 
                  : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <FiUsers className="mr-3" size={18} />
            Users
          </NavLink>
          
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-black text-white font-medium' 
                  : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <FiSettings className="mr-3" size={18} />
            Settings
          </NavLink>
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="border-t border-gray-800 pt-4">
            <button
              onClick={logout}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span>Logout</span>
              <FiLogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-light text-gray-900">
            {/* Dynamic title based on route can be added here */}
          </h1>
          <div className="flex items-center space-x-4">
            {/* Notifications, User dropdown etc. can be added here */}
          </div>
        </div>
        
        {/* Content Container */}
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;