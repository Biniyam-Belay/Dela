// frontend/src/components/ui/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext'; // Import useCart

const formatCurrency = (amount) => { /* ... (keep existing function) */ };

const ProductCard = ({ product }) => {
  const { addItem } = useCart(); // Get addItem function from context
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg';

   const handleAddToCart = (e) => {
        e.stopPropagation(); // Prevent link navigation
        if (product.stockQuantity > 0) {
            addItem(product, 1); // Add 1 item to cart
            // Maybe show a small confirmation/toast?
            alert(`${product.name} added to cart!`); // Simple feedback for now
        }
   };

  return (
    <div className="group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out bg-white transform hover:-translate-y-1">
      <Link to={`/products/${product.slug || product.id}`} className="block">
        <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden"> {/* Image Container */}
             <img src={imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}/>
        </div>
        <div className="p-4"> {/* Content Area */}
          {product.category && (<span className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">{product.category.name}</span>)}
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 truncate" title={product.name}>{product.name}</h3>
          <p className="text-lg md:text-xl font-bold text-blue-700 mb-3">{formatCurrency(product.price)}</p>
        </div>
      </Link>
      <div className="px-4 pb-4 pt-0"> {/* Add to Cart Button Area */}
        <button
          disabled={product.stockQuantity <= 0}
          className={`w-full px-4 py-2 rounded text-white font-semibold transition-colors duration-200 ${product.stockQuantity > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          onClick={handleAddToCart} // Use the handler
        >
          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;