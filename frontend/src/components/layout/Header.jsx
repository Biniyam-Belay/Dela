// frontend/src/components/layout/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext.jsx'
import { useCart } from '../../contexts/CartContext.jsx'; // Import useCart
import { FaShoppingCart } from 'react-icons/fa'; // Import Cart icon

const Header = () => {
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const { cartCount } = useCart(); // Get cartCount
    const navigate = useNavigate();

    const handleLogout = () => { /* ... (keep existing handler) */ };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-blue-700">SuriAddis</Link>

                {/* Navigation Links */}
                <div className="hidden md:flex space-x-6 items-center">
                     <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
                     <Link to="/products" className="text-gray-600 hover:text-blue-600">Products</Link>
                </div>

                {/* Auth Links, User Info & Cart */}
                <div className="flex items-center space-x-4">
                     {/* Cart Icon */}
                     <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative p-2" title="Shopping Cart">
                         <FaShoppingCart size={22} />
                         {cartCount > 0 && (
                             <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                 {cartCount}
                             </span>
                         )}
                     </Link>

                    {/* Auth Loading/State */}
                    {isLoading ? (
                         <span className="text-gray-500">Loading...</span>
                     ) : isAuthenticated ? (
                       <>
                           <span className="text-gray-700 hidden sm:inline">Hi, {user?.name?.split(' ')[0]}</span>
                           <Link to="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
                           <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition duration-200">Logout</button>
                       </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition duration-300">Register</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;