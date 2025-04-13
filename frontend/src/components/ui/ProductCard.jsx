import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { FiShoppingBag, FiHeart, FiEye } from 'react-icons/fi';

// Get Supabase URL and define bucket name
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const bucketName = 'products'; // Replace with your actual bucket name if different
const localPlaceholder = '/placeholder-image.jpg'; // Path relative to the public folder

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Construct Supabase Storage public image URL
  // Assumes image paths stored in DB start with '/' (e.g., '/product-image.jpg')
  const imageUrl = product.images?.[0]
    ? `${supabaseUrl}/storage/v1/object/public/${bucketName}${product.images[0]}`
    : localPlaceholder; // Use local placeholder if no image in DB

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stockQuantity > 0) {
      addItem(product, 1);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div 
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <Link to={`/products/${product.slug || product.id}`} className="block relative aspect-[3/4]">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = localPlaceholder; // Fallback to local placeholder on error
          }}
        />
        
        {/* Quick Actions (appear on hover) */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center gap-4 transition-opacity duration-300">
            <button 
              onClick={toggleWishlist}
              className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <FiHeart className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-700"} />
            </button>
            <button className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors" aria-label="Quick view">
              <FiEye className="text-gray-700" />
            </button>
          </div>
        )}
        
        {/* Stock Status Badge */}
        {product.stockQuantity <= 0 && (
          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
            Out of Stock
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/products/${product.slug || product.id}`} className="hover:text-gray-900 transition-colors">
            <h3 className="font-medium text-gray-800 line-clamp-2">{product.name}</h3>
          </Link>
          <button 
            onClick={toggleWishlist}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FiHeart className={isWishlisted ? "text-red-500 fill-red-500" : ""} />
          </button>
        </div>
        
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{product.category.name}</p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold text-gray-900">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)}
          </span>
          
          {/* Rating (if available) */}
          {product.rating > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-1">{product.rating.toFixed(1)}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stockQuantity <= 0}
          className={`w-full mt-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            product.stockQuantity > 0
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FiShoppingBag />
          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;