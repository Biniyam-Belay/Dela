import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSearch,
  FiChevronDown,
  FiMenu,
  FiX,
  FiTag,
  FiBarChart,
  FiUser,
} from 'react-icons/fi';
import { Search, ShoppingCart, User, Menu, X, Store, Home } from "lucide-react";
import { useAuth } from '../../contexts/authContext.jsx';

// Font stacks for luxury, flowing look (matching homepage)
const flowingSerif = '"Playfair Display", "Georgia", serif';
const flowingSans = '"Inter", "Helvetica Neue", Arial, sans-serif';

// Helper function to get page title
const getPageTitle = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return 'Dashboard';

  const page = segments[1];
  const action = segments[2];
  const id = segments[3];

  switch (page) {
    case 'dashboard': return 'Seller Dashboard';
    case 'collections':
      if (action === 'new') return 'Create Collection';
      if (action === 'edit' && id) return 'Edit Collection';
      return 'My Collections';
    case 'products': return 'My Products';
    case 'orders': return 'My Orders';
    case 'earnings': return 'Earnings';
    case 'profile': return 'Seller Profile';
    case 'settings': return 'Settings';
    default: return 'Seller Panel';
  }
};

const SellerLayout = () => {
  const { logout, user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);

  // Handle scroll effect (matching homepage)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'SE';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar for Medium+ Screens - Updated with luxury styling */}
      <aside
        className={`hidden md:flex flex-col fixed h-full z-30 bg-white/95 backdrop-blur-md border-r border-black/10 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-black/10 flex items-center justify-between h-16 md:h-20">
          {!isSidebarCollapsed && (
            <Link to="/" className="font-bold text-xl tracking-widest text-black" style={{fontFamily: flowingSerif, letterSpacing: '0.18em', textTransform: 'uppercase'}}>
              DELA
            </Link>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="ml-auto p-2 rounded-md hover:bg-black/5 text-black"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FiBarChart className="h-5 w-5" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            <NavLink 
              to="/seller/dashboard" 
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-all ${isActive ? "bg-black/10 text-black font-medium" : "text-black/70 hover:bg-black/5 hover:text-black"}`}
              end
            >
              <FiGrid className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-sm font-medium" style={{fontFamily: flowingSans}}>Dashboard</span>}
            </NavLink>
            <NavLink 
              to="/seller/collections" 
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-all ${isActive ? "bg-black/10 text-black font-medium" : "text-black/70 hover:bg-black/5 hover:text-black"}`}
            >
              <FiTag className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-sm font-medium" style={{fontFamily: flowingSans}}>Collections</span>}
            </NavLink>
            <NavLink 
              to="/seller/products" 
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-all ${isActive ? "bg-black/10 text-black font-medium" : "text-black/70 hover:bg-black/5 hover:text-black"}`}
            >
              <FiBox className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-sm font-medium" style={{fontFamily: flowingSans}}>Products</span>}
            </NavLink>
            <NavLink 
              to="/seller/orders" 
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-all ${isActive ? "bg-black/10 text-black font-medium" : "text-black/70 hover:bg-black/5 hover:text-black"}`}
            >
              <FiShoppingBag className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-sm font-medium" style={{fontFamily: flowingSans}}>Orders</span>}
            </NavLink>
            <NavLink 
              to="/seller/earnings" 
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-all ${isActive ? "bg-black/10 text-black font-medium" : "text-black/70 hover:bg-black/5 hover:text-black"}`}
            >
              <FiDollarSign className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-sm font-medium" style={{fontFamily: flowingSans}}>Earnings</span>}
            </NavLink>
            <NavLink 
              to="/seller/profile" 
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-all ${isActive ? "bg-black/10 text-black font-medium" : "text-black/70 hover:bg-black/5 hover:text-black"}`}
            >
              <FiUser className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-sm font-medium" style={{fontFamily: flowingSans}}>Profile</span>}
            </NavLink>
            <NavLink 
              to="/seller/settings" 
              className={({ isActive }) => `flex items-center gap-3 p-3 rounded-md transition-all ${isActive ? "bg-black/10 text-black font-medium" : "text-black/70 hover:bg-black/5 hover:text-black"}`}
            >
              <FiSettings className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="uppercase tracking-wider text-sm font-medium" style={{fontFamily: flowingSans}}>Settings</span>}
            </NavLink>
          </div>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-black/10">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-3 rounded-md text-black/70 hover:bg-black/5 hover:text-black transition-all"
          >
            <FiLogOut className="h-5 w-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="uppercase tracking-wider text-sm font-medium" style={{fontFamily: flowingSans}}>Logout</span>}
          </button>
        </div>
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
          {/* Mobile Sidebar - Updated with luxury styling */}
          <aside
            className={`fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md border-r border-black/10 z-40 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            {/* Mobile Header */}
            <div className="p-4 border-b border-black/10 flex items-center justify-between h-16">
              <Link to="/" className="font-bold text-2xl tracking-widest text-black" style={{fontFamily: flowingSerif, letterSpacing: '0.18em', textTransform: 'uppercase'}}>
                DELA
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-black/5 text-black"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                <Link 
                  to="/" 
                  className="flex items-center gap-3 p-3 text-black hover:bg-black/5 transition-all uppercase tracking-wider font-medium rounded-md"
                  style={{fontFamily: flowingSans}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  <span>Back to Shop</span>
                </Link>
                <NavLink 
                  to="/seller/dashboard" 
                  className={({ isActive }) => `flex items-center gap-3 p-3 transition-all uppercase tracking-wider font-medium rounded-md ${isActive ? "bg-black/10 text-black" : "text-black hover:bg-black/5"}`}
                  style={{fontFamily: flowingSans}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiGrid className="h-5 w-5" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink 
                  to="/seller/collections" 
                  className={({ isActive }) => `flex items-center gap-3 p-3 transition-all uppercase tracking-wider font-medium rounded-md ${isActive ? "bg-black/10 text-black" : "text-black hover:bg-black/5"}`}
                  style={{fontFamily: flowingSans}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiTag className="h-5 w-5" />
                  <span>Collections</span>
                </NavLink>
                <NavLink 
                  to="/seller/products" 
                  className={({ isActive }) => `flex items-center gap-3 p-3 transition-all uppercase tracking-wider font-medium rounded-md ${isActive ? "bg-black/10 text-black" : "text-black hover:bg-black/5"}`}
                  style={{fontFamily: flowingSans}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiBox className="h-5 w-5" />
                  <span>Products</span>
                </NavLink>
                <NavLink 
                  to="/seller/orders" 
                  className={({ isActive }) => `flex items-center gap-3 p-3 transition-all uppercase tracking-wider font-medium rounded-md ${isActive ? "bg-black/10 text-black" : "text-black hover:bg-black/5"}`}
                  style={{fontFamily: flowingSans}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiShoppingBag className="h-5 w-5" />
                  <span>Orders</span>
                </NavLink>
                <NavLink 
                  to="/seller/earnings" 
                  className={({ isActive }) => `flex items-center gap-3 p-3 transition-all uppercase tracking-wider font-medium rounded-md ${isActive ? "bg-black/10 text-black" : "text-black hover:bg-black/5"}`}
                  style={{fontFamily: flowingSans}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiDollarSign className="h-5 w-5" />
                  <span>Earnings</span>
                </NavLink>
                <NavLink 
                  to="/seller/profile" 
                  className={({ isActive }) => `flex items-center gap-3 p-3 transition-all uppercase tracking-wider font-medium rounded-md ${isActive ? "bg-black/10 text-black" : "text-black hover:bg-black/5"}`}
                  style={{fontFamily: flowingSans}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiUser className="h-5 w-5" />
                  <span>Profile</span>
                </NavLink>
                <NavLink 
                  to="/seller/settings" 
                  className={({ isActive }) => `flex items-center gap-3 p-3 transition-all uppercase tracking-wider font-medium rounded-md ${isActive ? "bg-black/10 text-black" : "text-black hover:bg-black/5"}`}
                  style={{fontFamily: flowingSans}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiSettings className="h-5 w-5" />
                  <span>Settings</span>
                </NavLink>
              </div>
            </nav>
            
            {/* Mobile Footer */}
            <div className="p-4 border-t border-black/10">
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 text-black hover:bg-black/5 transition-all uppercase tracking-wider font-medium rounded-md"
                style={{fontFamily: flowingSans}}
              >
                <FiLogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area Wrapper */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        {/* Header - Matching Homepage Style */}
        <header className={`fixed top-0 right-0 h-16 md:h-20 z-20 transition-all duration-500 ${isSidebarCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"} ${isScrolled ? 'bg-white/80 shadow-lg backdrop-blur-xl' : 'bg-white/60 backdrop-blur-md shadow-md'}`} style={{fontFamily: flowingSans, borderBottom: 'none', transition: 'background 0.5s cubic-bezier(.4,0,.2,1), box-shadow 0.5s cubic-bezier(.4,0,.2,1)'}}>
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Left side: Mobile Menu Toggle + Logo/Title */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 -ml-2 rounded-md hover:bg-white/20 text-black md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
                {/* Logo/Brand (matching homepage) */}
                <Link to="/" className={`font-bold text-2xl md:text-3xl tracking-widest ${isScrolled ? 'text-black' : 'text-black'}`} style={{fontFamily: flowingSerif, letterSpacing: '0.18em', textTransform: 'uppercase', textShadow: isScrolled ? 'none' : '0 2px 12px rgba(0,0,0,0.12)'}}>
                  DELA
                </Link>
                {/* Separator */}
                <div className="hidden md:block h-6 w-px bg-black/20"></div>
                {/* Seller Portal Label */}
                <div className="hidden md:block">
                  <span className="text-sm font-light uppercase tracking-widest text-black/60" style={{fontFamily: flowingSans, letterSpacing: '0.18em'}}>
                    Seller Portal
                  </span>
                </div>
              </div>

              {/* Center - Empty space for clean look */}
              <div className="hidden md:flex flex-1"></div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <button className={`hidden md:flex items-center ${isScrolled ? 'text-neutral-700 hover:text-black' : 'text-black hover:text-neutral-700'} transition-colors`} style={{textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}>
                  <Search className="h-5 w-5" />
                </button>
                
                {/* Notifications */}
                <button className={`relative ${isScrolled ? 'text-neutral-700 hover:text-black' : 'text-black hover:text-neutral-700'} transition-colors`} style={{textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}>
                  <FiBell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 bg-black rounded-full h-2 w-2 border-2 border-white" style={{display:'block'}}></span>
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={`flex items-center gap-2 ${isScrolled ? 'text-neutral-700 hover:text-black' : 'text-black hover:text-neutral-700'} transition-colors`}
                    style={{textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}
                    aria-expanded={isUserDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center overflow-hidden">
                      <span className="text-sm font-medium text-black">{getUserInitials()}</span>
                    </div>
                    <FiChevronDown className="h-4 w-4 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white/95 backdrop-blur-md py-2 shadow-xl border border-black/10 focus:outline-none z-50 animate-fadeIn"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                    >
                      <div className="px-6 py-3 border-b border-black/10">
                        <p className="text-sm font-medium text-black truncate" style={{fontFamily: flowingSans}}>{user?.email || 'Seller'}</p>
                        <p className="text-xs text-black/60 uppercase tracking-wider" style={{fontFamily: flowingSans}}>Seller Account</p>
                      </div>
                      <Link
                        to="/seller/profile"
                        className="block px-6 py-3 text-sm text-black hover:bg-black/5 transition-all uppercase tracking-wider font-medium"
                        style={{fontFamily: flowingSans}}
                        role="menuitem"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/seller/settings"
                        className="block px-6 py-3 text-sm text-black hover:bg-black/5 transition-all uppercase tracking-wider font-medium"
                        style={{fontFamily: flowingSans}}
                        role="menuitem"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="block w-full text-left px-6 py-3 text-sm text-black hover:bg-black/5 transition-all uppercase tracking-wider font-medium"
                        style={{fontFamily: flowingSans}}
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-4 pt-20 md:pt-24 sm:p-6 sm:pt-26">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
