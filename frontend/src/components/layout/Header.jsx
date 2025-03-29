import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { 
  FiShoppingBag, 
  FiUser, 
  FiSearch, 
  FiMenu, 
  FiX,
  FiHeart
} from 'react-icons/fi';

const Header = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/about' },
  ];

  const activeStyle = ({ isActive }) =>
    isActive
      ? 'text-black font-medium border-b-2 border-black'
      : 'text-gray-600 hover:text-black transition-colors duration-300';

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
      {/* Desktop Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-light tracking-wider hover:opacity-80 transition-opacity"
        >
          suriAddis
        </Link>

        {/* Desktop Navigation Links (Centered) */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-8">
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path} 
              className={`${activeStyle} text-sm uppercase tracking-wider`}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right-aligned Icons */}
        <div className="flex items-center space-x-6">

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="text-gray-600 hover:text-black transition-colors"
            aria-label="Wishlist"
          >
            <FiHeart size={18} />
          </Link>

          {/* User Account */}
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            className="text-gray-600 hover:text-black transition-colors"
            aria-label={isAuthenticated ? 'My Account' : 'Login'}
          >
            <FiUser size={18} />
          </Link>

          {/* Shopping Bag */}
          <Link
            to="/cart"
            className="relative text-gray-600 hover:text-black transition-colors"
            aria-label="Cart"
          >
            <FiShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-black transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white z-50 pt-20 px-6 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col space-y-8">
          {navLinks.map((link) => (
            <NavLink
              key={`mobile-${link.name}`}
              to={link.path}
              className={`${activeStyle} text-xl py-2`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}

          <div className="border-t border-gray-100 pt-6">
            {isLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block text-gray-600 hover:text-black py-3 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-black py-3 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-600 hover:text-black py-3 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-gray-600 hover:text-black py-3 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;