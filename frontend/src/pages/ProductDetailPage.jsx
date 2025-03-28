import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To get product ID/slug from URL
import { fetchProductByIdentifier } from '../services/productApi';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { identifier } = useParams(); // Get the identifier (slug or ID) from the URL parameter

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = await fetchProductByIdentifier(identifier);
        setProduct(productData.data);
      } catch (err) {
        setError(err.message || `Failed to load product ${identifier}.`);
        console.error(err); // Log the full error
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      loadProduct();
    } else {
        setError("No product identifier provided in URL.");
        setLoading(false);
    }
  }, [identifier]); // Re-fetch if identifier changes

  // --- Add to Cart Logic (Placeholder) ---
  const handleAddToCart = () => {
      if (product && product.stockQuantity > 0) {
          console.log(`Add ${product.name} to cart (ID: ${product.id})`);
          // Add logic using CartContext later
      }
  }


  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <p className="text-center text-gray-500">Product not found.</p>; // Should be caught by error state normally

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : '/placeholder-image.jpg';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.jpg'; }}
          />
           {/* Optional: Image Gallery for multiple images later */}
        </div>

        {/* Product Details */}
        <div className="md:w-1/2">
          {product.category && (
              <span className="text-sm text-gray-500 uppercase tracking-wider">{product.category.name}</span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold my-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-blue-700 my-4">
            {formatCurrency(product.price)}
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {/* Stock and Add to Cart */}
          <div className="mb-6">
            <p className={`font-semibold ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in Stock` : 'Out of Stock'}
            </p>
          </div>

          {/* Quantity Selector (Optional for now) */}
          {/* <div className="mb-6"> ... </div> */}

          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
            className={`w-full md:w-auto px-8 py-3 rounded text-white font-semibold text-lg transition-colors duration-200 ${
              product.stockQuantity > 0
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;