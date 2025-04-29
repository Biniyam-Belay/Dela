"use client"

import { useState, useEffect } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/authContext.jsx"
import { useSelector } from 'react-redux';
import { selectCartCount } from '../../store/cartSlice';
import { supabase } from "../../utils/supabaseClient"
import { Search, ShoppingCart, User, Menu, X } from "lucide-react"

// Font stacks for luxury, flowing look
const flowingSerif = '"Playfair Display", "Georgia", serif';
const flowingSans = '"Inter", "Helvetica Neue", Arial, sans-serif';

const Header = () => {
  const { isAuthenticated, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
    { name: "Wishlist", path: "/wishlist" },
  ]

  const activeStyle = ({ isActive }) =>
    isActive
      ? "text-black font-medium border-b border-black"
      : "text-neutral-600 hover:text-black transition-colors duration-300"

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 shadow-lg backdrop-blur-xl' : 'bg-white/60 backdrop-blur-md shadow-md'} `} style={{fontFamily: flowingSans, borderBottom: 'none', transition: 'background 0.5s cubic-bezier(.4,0,.2,1), box-shadow 0.5s cubic-bezier(.4,0,.2,1)'}}>
      <div className="container mx-auto px-8 md:px-16">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo Left */}
          <Link to="/" className={`font-bold text-3xl tracking-widest ${isScrolled ? 'text-black' : 'text-black'} `} style={{fontFamily: flowingSerif, letterSpacing: '0.18em', textTransform: 'uppercase', textShadow: isScrolled ? 'none' : '0 2px 12px rgba(0,0,0,0.12)'}}>
            DELA
          </Link>
          {/* Nav Centered (desktop only) */}
          <nav className="hidden md:flex flex-1 justify-center items-center space-x-14">
            <Link to="/products" className={`text-sm font-light uppercase tracking-[0.18em] px-2 py-1 transition-all duration-200 border-b-2 border-transparent hover:border-black ${isScrolled ? 'text-neutral-800 hover:border-black' : 'text-black hover:border-black'}`} style={{fontFamily: flowingSans, letterSpacing: '0.18em', textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}>
              All Products
            </Link>
            <Link to="/collections" className={`text-sm font-light uppercase tracking-[0.18em] px-2 py-1 transition-all duration-200 border-b-2 border-transparent hover:border-black ${isScrolled ? 'text-neutral-800 hover:border-black' : 'text-black hover:border-black'}`} style={{fontFamily: flowingSans, letterSpacing: '0.18em', textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}>
              Collections
            </Link>
            <Link to="/wishlist" className={`text-sm font-light uppercase tracking-[0.18em] px-2 py-1 transition-all duration-200 border-b-2 border-transparent hover:border-black ${isScrolled ? 'text-neutral-800 hover:border-black' : 'text-black hover:border-black'}`} style={{fontFamily: flowingSans, letterSpacing: '0.18em', textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}>
              Wishlist
            </Link>
          </nav>
          {/* Actions Right */}
          <div className="flex items-center space-x-4">
            <button className={`hidden md:flex items-center ${isScrolled ? 'text-neutral-700 hover:text-black' : 'text-black hover:text-neutral-700'} transition-colors`} style={{textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}>
              <Search className="h-5 w-5" />
            </button>
            <Link to={isAuthenticated ? "/profile" : "/login"} className={`${isScrolled ? 'text-neutral-700 hover:text-black' : 'text-black hover:text-neutral-700'} transition-colors`} style={{textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}>
              <User className="h-5 w-5" />
            </Link>
            <Link to="/cart" className={`${isScrolled ? 'text-neutral-700 hover:text-black' : 'text-black hover:text-neutral-700'} relative transition-colors`} style={{textShadow: isScrolled ? 'none' : '0 2px 8px rgba(0,0,0,0.12)'}}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-black rounded-full h-2 w-2 border-2 border-white" style={{display:'block'}}></span>
              )}
            </Link>
            {/* Hamburger menu icon (mobile only) */}
            <button
              className="flex items-center md:hidden p-2 rounded hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-black"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <Menu className="h-7 w-7 text-black" />
            </button>
          </div>
        </div>
      </div>
      {/* Simple Dropdown Menu (mobile only, below hamburger) */}
      {isMenuOpen && (
        <div className="md:hidden absolute right-4 top-20 w-56 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 animate-fadeIn">
          <nav className="flex flex-col py-2">
            <Link to="/products" className="px-6 py-3 text-base font-medium uppercase tracking-widest text-black hover:bg-neutral-100 transition-all" style={{fontFamily: flowingSans}} onClick={() => setIsMenuOpen(false)}>
              All Products
            </Link>
            <Link to="/collections" className="px-6 py-3 text-base font-medium uppercase tracking-widest text-black hover:bg-neutral-100 transition-all" style={{fontFamily: flowingSans}} onClick={() => setIsMenuOpen(false)}>
              Collections
            </Link>
            <Link to="/wishlist" className="px-6 py-3 text-base font-medium uppercase tracking-widest text-black hover:bg-neutral-100 transition-all" style={{fontFamily: flowingSans}} onClick={() => setIsMenuOpen(false)}>
              Wishlist
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
