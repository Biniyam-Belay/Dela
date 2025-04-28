import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProductByIdentifier } from '../services/productApi';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useDispatch } from 'react-redux';
import { addItemOptimistic, addItemToCart, fetchCart } from '../store/cartSlice';
import { FiShoppingCart, FiChevronLeft, FiMinus, FiPlus } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(numericAmount) 
    ? 'N/A' 
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericAmount);
};

const StarRating = ({ rating, reviewCount }) => {
  if (!rating) return null;
  
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            size={14}
            className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'} 
          />
        ))}
      </div>
      {reviewCount > 0 && (
        <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
      )}
    </div>
  );
};

const ProductDetailPage = () => {
  const { identifier } = useParams();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // Use React Query to fetch product
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product-detail', identifier],
    queryFn: () => fetchProductByIdentifier(identifier),
    staleTime: 1000 * 60 * 5,
  });

  const product = data?.data;

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, Math.min(product?.stockQuantity || 1, prev + amount)));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product?.stockQuantity > 0) {
      if (isAdding) return;
      setIsAdding(true);
      dispatch(addItemOptimistic({ product, quantity }));
      dispatch(addItemToCart({ product, quantity }))
        .unwrap()
        .then(() => toast.success(`${quantity} × ${product.name} added to cart!`))
        .catch((err) => {
          toast.error(err || 'Failed to add to cart');
          dispatch(fetchCart()); // Revert optimistic update by re-fetching cart
        })
        .finally(() => setIsAdding(false));
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/placeholder-image.jpg';
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <ErrorMessage message={error.message || error} />
      <Link 
        to="/products" 
        className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <FiChevronLeft className="mr-1" />
        Back to products
      </Link>
    </div>
  );

  if (!product) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-gray-500 mb-4">Product not found</p>
      <Link 
        to="/products" 
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <FiChevronLeft className="mr-1" />
        Browse products
      </Link>
    </div>
  );

  // Construct proper image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6 sm:mb-8">
          <Link 
            to="/products" 
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors text-sm sm:text-base"
          >
            <FiChevronLeft className="mr-1.5" size={18} />
            Back to Products
          </Link>
        </div>

        {/* Product Container - Responsive Flex */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Image Gallery - Responsive Width */}
          <div className="w-full lg:w-1/2">
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-4 aspect-square">
              <img
                src={getImageUrl(product.images?.[selectedImage])}
                alt={product.name}
                className="w-full h-full object-contain p-4 sm:p-8"
                onError={handleImageError}
                loading="lazy"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-md overflow-hidden border ${
                      selectedImage === index 
                        ? 'border-indigo-500 ring-1 ring-indigo-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Responsive Width */}
          <div className="w-full lg:w-1/2">
            {/* Category */}
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="inline-block text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 uppercase tracking-wider mb-2"
              >
                {product.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />

            {/* Price */}
            <div className="mb-5 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-medium text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.price < product.originalPrice && (
                <span className="text-base sm:text-lg text-gray-400 line-through ml-3">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="prose max-w-none text-gray-600 mb-6 sm:mb-8">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            {/* Stock Status */}
            <p className={`text-sm sm:text-base mb-6 ${
              product.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {product.stockQuantity > 0 
                ? `${product.stockQuantity} available in stock` 
                : 'Currently out of stock'}
            </p>

            {/* Quantity Selector */}
            {product.stockQuantity > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="sr-only">Quantity</label>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 sm:p-3 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={18} />
                    </button>
                    <span className="w-12 text-center py-1 sm:py-2 font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockQuantity}
                      className="p-2 sm:p-3 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stockQuantity <= 0}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    product.stockQuantity > 0
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FiShoppingCart size={18} />
                  {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Details</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {product.sku && <li><span className="font-medium">SKU:</span> {product.sku}</li>}
                {product.weight && <li><span className="font-medium">Weight:</span> {product.weight}</li>}
                {product.dimensions && <li><span className="font-medium">Dimensions:</span> {product.dimensions}</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;