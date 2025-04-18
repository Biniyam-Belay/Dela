import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'; // Import Link
import {
  FiBarChart,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiBox,
  FiTag,
  FiGrid,
  FiMenu, // Add Menu icon
  FiX, // Add Close icon
} from 'react-icons/fi';
import { useAuth } from '../../contexts/authContext.jsx';

// Helper function to get page title
const getPageTitle = (pathname) => {
  const segments = pathname.split('/').filter(Boolean); // Remove empty strings
  if (segments.length < 2) return 'Dashboard'; // Default

  const page = segments[1];
  const action = segments[2];
  const id = segments[3];

  switch (page) {
    case 'dashboard': return 'Dashboard';
    case 'products':
      if (action === 'new') return 'Add New Product';
      if (action === 'edit' && id) return 'Edit Product';
      return 'Products';
    case 'categories':
      if (action === 'new') return 'Add New Category';
      if (action === 'edit' && id) return 'Edit Category';
      return 'Categories';
    case 'orders': return 'Orders';
    case 'users': return 'Users';
    case 'settings': return 'Settings';
    default: return 'Admin Panel'; // Fallback
  }
};

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // State for user dropdown
  const location = useLocation();
  const dropdownRef = useRef(null); // Ref for dropdown click outside

  const pageTitle = getPageTitle(location.pathname); // Get dynamic title

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors ${
      isActive ? "bg-slate-100 font-medium" : ""
    }`;

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const SidebarContent = ({ isCollapsed }) => (
    <>
      <div className="p-4 border-b border-slate-200 flex items-center justify-between h-16"> {/* Fixed height */}
        {!isCollapsed && <h2 className="text-xl font-semibold text-slate-900">SuriAddis</h2>}
        {/* Collapse button only visible on md+ screens */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="ml-auto p-2 rounded-md hover:bg-slate-100 text-slate-700 hidden md:block"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FiBarChart className="h-5 w-5" />
        </button>
        {/* Close button for mobile overlay */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="ml-auto p-2 rounded-md hover:bg-slate-100 text-slate-700 md:hidden"
          aria-label="Close menu"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <NavLink to="/admin/dashboard" className={getNavLinkClass} end>
              <FiGrid className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/products" className={getNavLinkClass}>
              <FiBox className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Products</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/categories" className={getNavLinkClass}>
              <FiTag className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Categories</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/orders" className={getNavLinkClass}>
              <FiShoppingBag className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Orders</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/users" className={getNavLinkClass}>
              <FiUsers className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Users</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/finance" className={getNavLinkClass}>
              <FiDollarSign className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Finance</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/settings" className={getNavLinkClass}>
              <FiSettings className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => {
            logout();
            setIsMobileMenuOpen(false); // Close menu on logout
          }}
          className="w-full flex items-center gap-3 p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <FiLogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar for Medium+ Screens */}
      <aside
        className={`hidden md:flex flex-col fixed h-full z-30 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <SidebarContent isCollapsed={isSidebarCollapsed} />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
          {/* Mobile Sidebar */}
          <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <SidebarContent isCollapsed={false} /> {/* Always expanded in mobile overlay */}
          </aside>
        </>
      )}

      {/* Main Content Area Wrapper - Adjusted: No top padding here */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        {/* Header - Fixed for all sizes */}
        {/* Adjusted: Left margin calculation for desktop */}
        <header className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 z-20 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"}`}>
          <div className="flex items-center justify-between p-4 h-full">
            {/* Left side: Mobile Menu Toggle OR Dynamic Page Title on Desktop */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-700 md:hidden" // Only show on mobile
                aria-label="Open menu"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              {/* Dynamic Title - Show on desktop */}
              <h1 className="hidden md:block text-lg font-semibold text-slate-800">{pageTitle}</h1>
            </div>

            {/* Right side of header */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search */}
              <div className="relative hidden sm:block"> {/* Hide search on very small screens */}
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-32 sm:w-48 md:w-64 pl-9 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                />
              </div>
              {/* Notifications */}
              <button className="relative p-2 rounded-full border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800">
                <span className="sr-only">View notifications</span>
                <FiBell className="h-5 w-5" />
                {/* Example notification badge */}
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-500"
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    <span className="text-sm font-medium text-slate-600">{getUserInitials()}</span>
                    {/* Add user image here if available */}
                  </div>
                  <FiChevronDown className="h-4 w-4 text-slate-500 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50" // Ensure high z-index
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">{user?.email || 'Admin User'}</p>
                      <p className="text-xs text-slate-500">Administrator</p>
                    </div>
                    <Link
                      to="/admin/settings" // Link to settings or profile page
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      role="menuitem"
                      onClick={() => setIsUserDropdownOpen(false)} // Close on click
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false); // Close dropdown
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Container - Adjusted: Added pt-16 for fixed header */}
        <main className="p-4 pt-20 sm:p-6 sm:pt-22"> {/* pt-16 + p-4/p-6 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;