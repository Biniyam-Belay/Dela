"use client"

import { useState, useEffect } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/authContext.jsx"
import { useSelector } from 'react-redux';
import { selectCartCount } from '../../store/cartSlice';
import { supabase } from "../../utils/supabaseClient"
import { Search, ShoppingCart, User } from "lucide-react"

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
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-neutral-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="font-medium text-xl">
            DELA
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-sm hover:text-neutral-500 transition-colors">
              All Products
            </Link>
            <Link to="/categories" className="text-sm hover:text-neutral-500 transition-colors">
              Categories
            </Link>
            <Link to="/collections" className="text-sm hover:text-neutral-500 transition-colors">
              Collections
            </Link>
            <Link to="/about" className="text-sm hover:text-neutral-500 transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center text-neutral-600 hover:text-neutral-900">
              <Search className="h-5 w-5" />
            </button>
            <Link to={isAuthenticated ? "/profile" : "/login"} className="text-neutral-600 hover:text-neutral-900">
              <User className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="text-neutral-600 hover:text-neutral-900 relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
