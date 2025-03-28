import React from 'react';
import { Link } from 'react-router-dom';

const formatCurrency = (amount) => {
   // Make sure price is a number before formatting
    const numericPrice = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericPrice)) {
        return 'N/A'; // Or some other placeholder if price is invalid
    }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericPrice);
};

const ProductCard = ({ product }) => {
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : '/placeholder-image.jpg';

  return (
    <div className="group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out bg-white transform hover:-translate-y-1">
      <Link to={`/products/${product.slug || product.id}`} className="block">
        {/* Image Container */}
        <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" // Subtle zoom on hover
              onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
            />
        </div>
         {/* Content Area */}
        <div className="p-4">
          {product.category && (
             <span className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">{product.category.name}</span>
           )}
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 truncate" title={product.name}>
            {product.name}
          </h3>
          <p className="text-lg md:text-xl font-bold text-blue-700 mb-3">
            {formatCurrency(product.price)}
          </p>
          {/* Stock indicator is optional on card, could show on hover */}
           {/* <p className={`text-sm ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
             {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
           </p> */}
        </div>
      </Link>
       {/* Add to Cart Button Area - Adjusted padding */}
       <div className="px-4 pb-4 pt-0">
           <button
             disabled={product.stockQuantity <= 0}
             className={`w-full px-4 py-2 rounded text-white font-semibold transition-colors duration-200 ${
               product.stockQuantity > 0
                 ? 'bg-blue-600 hover:bg-blue-700'
                 : 'bg-gray-400 cursor-not-allowed'
             }`}
             onClick={(e) => {
                e.stopPropagation();
                if(product.stockQuantity > 0) {
                    console.log(`Add ${product.name} to cart (ID: ${product.id})`);
                    // Call addToCart function here later
                }
             }}
           >
             {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
           </button>
         </div>
    </div>
  );
};

export default ProductCard;