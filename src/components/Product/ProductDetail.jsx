import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { useProducts } from '../../context/ProductContext';
// import { useCart } from '../../context/CartContext';

const ProductDetail = () => {
  const { productId } = useParams();
  const {
    selectedProduct,
    fetchProductById,
    productLoading,
    productError
  } = useProducts();
  // const { addToCart } = useCart();

  console.log(`[ProductDetail] Rendering with productId: ${productId}`);
  console.log(`[ProductDetail] Context state - productLoading: ${productLoading}, productError: ${productError}, selectedProduct:`, selectedProduct);

  useEffect(() => {
    if (productId) {
      console.log(`[ProductDetail] useEffect triggering fetchProductById for ID: ${productId}`);
      fetchProductById(productId);
    } else {
      console.warn('[ProductDetail] useEffect: productId is missing.');
    }
    // Cleanup function (optional)
    // return () => {
    //   console.log('[ProductDetail] Cleanup effect');
    // };
  }, [productId, fetchProductById]);

  if (productLoading) {
    return <div className="text-center mt-12">Loading product details...</div>;
  }

  if (productError) {
    return (
      <div className="text-center mt-12 text-red-600">
        <p>Error loading product: {productError}</p>
        <Link to="/products" className="text-blue-500 hover:underline mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  if (!selectedProduct) {
    // Avoid showing "Product not found" while loading is true
    if (!productLoading) {
      return (
        <div className="text-center mt-12">
          <p>Product not found.</p>
          <Link to="/products" className="text-blue-500 hover:underline mt-4 inline-block">Back to Products</Link>
        </div>
      );
    }
    // If loading is still true, the loading indicator above will be shown.
    return null;
  }

  // Determine the image URL - adjust field names ('imageUrl', 'image', 'images[0]') as needed based on your API response
  const imageUrl = selectedProduct.imageUrl || selectedProduct.image || (Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 ? selectedProduct.images[0] : null);
  // If image URLs are relative paths, prepend the backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'; // Make sure this is set in your .env
  const fullImageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${backendUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`) : '/placeholder-image.jpg'; // Default placeholder

  console.log(`[ProductDetail] Displaying product: ${selectedProduct.name}, Image URL used: ${fullImageUrl}`);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Products</Link>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow overflow-hidden">
            {imageUrl ? (
              <img
                src={fullImageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-contain" // Use object-contain to see the whole image
                onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.jpg'; }} // Handle image load errors
              />
            ) : (
              <span className="text-gray-500">No Image Available</span>
            )}
          </div>
          {/* Add thumbnail gallery here if selectedProduct.images is an array */}
        </div>

        {/* Product Info */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{selectedProduct.name}</h1>
          {/* Display category if available */}
          {selectedProduct.category && <p className="text-sm text-gray-500 mb-2">Category: {selectedProduct.category.name}</p>}
          <p className="text-2xl text-indigo-600 font-semibold mb-4">
            {/* Ensure price exists and format */}
            {typeof selectedProduct.price === 'number' ? `$${selectedProduct.price.toFixed(2)}` : 'Price not available'}
          </p>
          <p className="text-gray-700 mb-6 whitespace-pre-line">{selectedProduct.description || 'No description available.'}</p>

          {/* Display stock if available */}
          {typeof selectedProduct.stockQuantity === 'number' && (
            <p className={`text-sm mb-4 ${selectedProduct.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {selectedProduct.stockQuantity > 0 ? `${selectedProduct.stockQuantity} in stock` : 'Out of Stock'}
            </p>
          )}

          {/* Add to Cart Button */}
          <button
            // onClick={() => addToCart(selectedProduct)}
            disabled={!selectedProduct.stockQuantity || selectedProduct.stockQuantity <= 0}
            className="w-full sm:w-auto bg-indigo-600 text-white py-3 px-6 rounded hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedProduct.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
