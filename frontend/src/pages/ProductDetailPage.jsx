// frontend/src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductByIdentifier } from '../services/productApi';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useCart } from '../contexts/CartContext'; // Import useCart

const formatCurrency = (amount) => { /* ... (keep existing function) */ };

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); // Add quantity state
  const { identifier } = useParams();
  const { addItem } = useCart(); // Get addItem from context

  useEffect(() => { /* ... (keep existing fetch logic) */ }, [identifier]);

  const handleQuantityChange = (amount) => {
      setQuantity(prev => Math.max(1, prev + amount)); // Ensure quantity is at least 1
      // Optional: Cap quantity at product.stockQuantity
  };

  const handleAddToCart = () => {
      if (product && product.stockQuantity > 0) {
          addItem(product, quantity); // Add specified quantity
          alert(`${quantity} of ${product.name} added to cart!`); // Simple feedback
          setQuantity(1); // Reset quantity selector after adding
      }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <p className="text-center text-gray-500">Product not found.</p>;

  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.jpg';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Product Image */}
        <div className="md:w-1/2">
           <img src={imageUrl} alt={product.name} className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md" onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.jpg'; }} />
        </div>

        {/* Product Details */}
        <div className="md:w-1/2">
          {product.category && (<span className="text-sm text-gray-500 uppercase tracking-wider">{product.category.name}</span>)}
          <h1 className="text-3xl md:text-4xl font-bold my-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-blue-700 my-4">{formatCurrency(product.price)}</p>
          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
          <div className="mb-6"><p className={`font-semibold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.stockQuantity > 0 ? `${product.stockQuantity} in Stock` : 'Out of Stock'}</p></div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mb-6">
              <label htmlFor="quantity" className="font-semibold">Quantity:</label>
              <div className="flex items-center border rounded">
                  <button onClick={() => handleQuantityChange(-1)} className="px-3 py-1 border-r hover:bg-gray-100" disabled={quantity <= 1}>-</button>
                  <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} // Direct input handling
                      className="w-12 text-center py-1 focus:outline-none"
                      min="1"
                     // max={product.stockQuantity} // Optional: set max based on stock
                  />
                  <button onClick={() => handleQuantityChange(1)} className="px-3 py-1 border-l hover:bg-gray-100" /*disabled={quantity >= product.stockQuantity}*/>+</button>
              </div>
          </div>

          <button
            onClick={handleAddToCart} // Use handler
            disabled={product.stockQuantity <= 0}
            className={`w-full md:w-auto px-8 py-3 rounded text-white font-semibold text-lg transition-colors duration-200 ${product.stockQuantity > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;