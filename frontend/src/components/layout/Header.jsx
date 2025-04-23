"use client"

import { useState, useEffect } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/authContext.jsx"
import { FiShoppingBag, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiChevronRight } from "react-icons/fi"
import { useSelector } from 'react-redux';
import { selectCartCount } from '../../store/cartSlice';

const Header = () => {
  const { isAuthenticated, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const cartCount = useSelector(selectCartCount);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsMobileMenuOpen(false)
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    { name: "Collections", path: "/collections" },
    { name: "About", path: "/about" },
  ]

  const activeStyle = ({ isActive }) =>
    isActive
      ? "text-black font-medium border-b border-black"
      : "text-neutral-600 hover:text-black transition-colors duration-300"

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white border-b border-neutral-200 py-3" : "bg-white/95 backdrop-blur-sm py-5"
      }`}
    >
      {/* Desktop Navigation */}
      <nav className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extralight tracking-widest hover:opacity-80 transition-opacity">
          suriAddis
        </Link>

        {/* Desktop Navigation Links (Centered) */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-10">
          {navLinks.map((link) => (
            <NavLink key={link.name} to={link.path} className={`${activeStyle} text-sm uppercase tracking-widest py-1`}>
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right-aligned Icons */}
        <div className="flex items-center space-x-7">
          {/* Search */}
          <button className="text-neutral-600 hover:text-black transition-colors hidden md:block" aria-label="Search">
            <FiSearch size={18} />
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="text-neutral-600 hover:text-black transition-colors hidden sm:block"
            aria-label="Wishlist"
          >
            <FiHeart size={18} />
          </Link>

          {/* User Account */}
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="text-neutral-600 hover:text-black transition-colors"
            aria-label={isAuthenticated ? "My Account" : "Login"}
          >
            <FiUser size={18} />
          </Link>

          {/* Shopping Bag */}
          <Link to="/cart" className="relative text-neutral-600 hover:text-black transition-colors" aria-label="Cart">
            <FiShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-neutral-600 hover:text-black transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white z-50 transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="absolute top-5 right-6">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-neutral-600 hover:text-black transition-colors"
            aria-label="Close menu"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex flex-col h-full justify-center px-10">
          <div className="mb-16">
            <Link
              to="/"
              className="text-3xl font-extralight tracking-widest"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              suriAddis
            </Link>
          </div>

          <div className="flex flex-col space-y-6">
            {navLinks.map((link) => (
              <NavLink
                key={`mobile-${link.name}`}
                to={link.path}
                className={({ isActive }) =>
                  `text-2xl font-light tracking-wide flex items-center justify-between group ${
                    isActive ? "text-black" : "text-neutral-600"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{link.name}</span>
                <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </div>

          <div className="border-t border-neutral-200 mt-10 pt-10">
            {isLoading ? (
              <div className="text-neutral-500">Loading...</div>
            ) : isAuthenticated ? (
              <div className="space-y-6">
                <Link
                  to="/profile"
                  className="block text-neutral-600 hover:text-black transition-colors text-lg font-light"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  to="/orders"
                  className="block text-neutral-600 hover:text-black transition-colors text-lg font-light"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  to="/wishlist"
                  className="block text-neutral-600 hover:text-black transition-colors text-lg font-light"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-neutral-600 hover:text-black transition-colors text-lg font-light"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <Link
                  to="/login"
                  className="block text-neutral-600 hover:text-black transition-colors text-lg font-light"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-neutral-600 hover:text-black transition-colors text-lg font-light"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          <div className="mt-auto mb-10 pt-10 border-t border-neutral-200">
            <div className="flex space-x-6">
              <a href="#" className="text-neutral-600 hover:text-black transition-colors">
                Instagram
              </a>
              <a href="#" className="text-neutral-600 hover:text-black transition-colors">
                Facebook
              </a>
              <a href="#" className="text-neutral-600 hover:text-black transition-colors">
                Pinterest
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
