import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  addItemToCart,
  updateQuantityOptimistic,
  updateQuantity,
  removeItemOptimistic,
  removeItem,
  clearLocalCartAndState,
  clearCart,
  fetchCart,
  selectCartStatus,
  selectCartError
} from '../store/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  const cartTotal = useSelector(selectCartTotal);
  const cartStatus = useSelector(selectCartStatus);
  const cartError = useSelector(selectCartError);
  const [isUpdating, setIsUpdating] = useState(false);

  // Find the specific item in the cart to check its current quantity
  const findItemQuantity = (productId) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const updateQuantityHandler = (productId, delta) => {
    if (isUpdating) return;

    const currentQuantity = findItemQuantity(productId);
    const finalQuantity = currentQuantity + delta;

    // If decrementing results in 0 or less, treat it as a remove action
    if (finalQuantity <= 0) {
      removeItemHandler(productId); // Delegate to the remove handler
      return;
    }

    // Otherwise, proceed with the update action
    setIsUpdating(true);
    // Dispatch optimistic update with the delta
    dispatch(updateQuantityOptimistic({ productId, delta })); 
    // Dispatch the async thunk with the delta
    dispatch(updateQuantity({ productId, delta }))
      .unwrap()
      .then(() => toast.success('Cart updated!'))
      .catch((err) => {
        toast.error(err || 'Failed to update cart');
        // Revert optimistic update by re-fetching cart state on error
        // Consider if a more targeted revert is needed, but fetchCart is simpler
        dispatch(fetchCart()); 
      })
      .finally(() => setIsUpdating(false));
  };

  const removeItemHandler = (productId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    dispatch(removeItemOptimistic(productId));
    dispatch(removeItem(productId))
      .unwrap()
      .then(() => toast.success('Item removed from cart!'))
      .catch((err) => {
        toast.error(err || 'Failed to remove item');
        dispatch(fetchCart());
      })
      .finally(() => setIsUpdating(false));
  };

  const clearCartHandler = () => {
    dispatch(clearLocalCartAndState()); // Optimistically clear UI
    toast.success('Cart cleared!');
    dispatch(clearCart())
      .unwrap()
      .catch((err) => {
        toast.error(err || 'Failed to clear cart');
        dispatch(fetchCart());
      });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900">Your Cart</h1>
          <Link 
            to="/products" 
            className="flex items-center text-gray-600 hover:text-black transition-colors text-sm sm:text-base"
          >
            <FiArrowLeft className="mr-2" />
            Continue Shopping
          </Link>
        </div>

        {cartStatus === 'loading' ? (
          <div className="flex justify-center py-20">Loading...</div>
        ) : cartError ? (
          <div className="flex justify-center py-20 text-red-500">{cartError}</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
            <p className="text-lg text-gray-600 mb-6">Your cart is empty</p>
            <Link
              to="/products"
              className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items */}
            <div className="lg:w-2/3 space-y-4">
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-100 gap-4 sm:gap-6"
                >
                  {/* Product Image */}
                  <Link 
                    to={`/products/${product.slug || product.id}`}
                    className="flex-shrink-0 w-full sm:w-auto"
                  >
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${
                        product.images?.[0]?.startsWith('/') ? '' : '/'
                      }${product.images?.[0] || ''}`}
                      alt={product.name}
                      className="w-full sm:w-20 h-20 object-cover rounded-md"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-grow w-full sm:w-auto">
                    <Link
                      to={`/products/${product.slug || product.id}`}
                      className="hover:text-black transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{product.name}</h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{formatCurrency(product.price)}</p>
                    
                    {/* Mobile-only quantity controls */}
                    <div className="sm:hidden flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => updateQuantityHandler(product.id, -1)}
                          className={`p-1 sm:p-2 rounded-full ${quantity <= 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                          disabled={quantity <= 1 || isUpdating}
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">{quantity}</span>
                        <button
                          onClick={() => updateQuantityHandler(product.id, 1)}
                          className="p-1 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100"
                          disabled={isUpdating}
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItemHandler(product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        disabled={isUpdating}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Desktop quantity controls */}
                  <div className="hidden sm:flex items-center space-x-4">
                    <button
                      onClick={() => updateQuantityHandler(product.id, -1)}
                      className={`p-2 rounded-full ${quantity <= 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                      disabled={quantity <= 1 || isUpdating}
                    >
                      <FiMinus size={16} />
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantityHandler(product.id, 1)}
                      className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                      disabled={isUpdating}
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:block w-24 text-right font-medium text-sm sm:text-base">
                    {formatCurrency(parseFloat(product.price) * quantity)}
                  </div>

                  {/* Desktop remove */}
                  <button
                    onClick={() => removeItemHandler(product.id)}
                    className="hidden sm:block text-gray-400 hover:text-red-500 transition-colors"
                    disabled={isUpdating}
                  >
                    <FiTrash2 size={18} />
                  </button>

                  {/* Mobile price */}
                  <div className="sm:hidden w-full text-right font-medium text-sm">
                    {formatCurrency(parseFloat(product.price) * quantity)}
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <div className="text-right">
                <button
                  onClick={clearCartHandler}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 sticky top-4 sm:top-8">
                <h2 className="text-lg sm:text-xl font-light text-gray-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">Order Summary</h2>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs sm:text-sm">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs sm:text-sm">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between border-t pt-3 sm:pt-4 text-base sm:text-lg font-medium">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full mt-4 sm:mt-6 bg-black text-white text-center py-2 sm:py-3 rounded-md hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;