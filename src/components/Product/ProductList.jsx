import React, { useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Link } from 'react-router-dom'; // For linking to product details

const ProductList = () => {
  const { products, loading, error, fetchProducts } = useProducts();

  // Fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
    // Add cleanup function if needed
    // return () => { /* cleanup logic */ };
  }, [fetchProducts]); // Dependency array includes fetchProducts

  if (loading) {
    return <div className="text-center mt-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center mt-8">No products found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id || product.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <Link to={`/products/${product._id || product.id}`}>
              {/* Basic image placeholder - replace with actual image */}
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                 {product.imageUrl ? (
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/>
                 ) : (
                    <span className="text-gray-500">No Image</span>
                 )}
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 truncate">{product.name}</h2>
                <p className="text-gray-700 mb-2">${product.price?.toFixed(2)}</p> {/* Ensure price exists and format */}
                {/* Add more details or actions like 'Add to Cart' button here */}
                 <button
                    // onClick={() => addToCart(product)} // Example: Add to cart functionality
                    className="mt-2 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-300"
                  >
                    View Details
                  </button>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {/* Add Pagination controls here if using pagination */}
    </div>
  );
};

export default ProductList;
