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
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

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

  const getEstimatedDelivery = () => {
    // Placeholder logic for estimated delivery
    return '3-5 business days';
  };

  const saveForLaterHandler = (productId) => {
    // Placeholder logic for saving item for later
    toast.success('Item saved for later!');
  };

  const applyPromoCodeHandler = (e) => {
    e.preventDefault();
    // Placeholder logic for applying promo code
    if (promoCode === 'DISCOUNT10') {
      setPromoMessage('Promo code applied successfully!');
      setPromoSuccess(true);
    } else {
      setPromoMessage('Invalid promo code.');
      setPromoSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-0 pt-28">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <h1 className="text-3xl sm:text-4xl font-sans font-semibold text-neutral-900 tracking-tight">Your Cart</h1>
          <Link 
            to="/products" 
            className="flex items-center text-neutral-500 hover:text-black transition-colors text-base font-normal border-b border-transparent hover:border-black pb-0.5"
          >
            <FiArrowLeft className="mr-2" />
            Continue Shopping
          </Link>
        </div>

        {cartStatus === 'loading' ? (
          <div className="flex justify-center py-32 text-xl text-neutral-400 font-light">Loading...</div>
        ) : cartError ? (
          <div className="flex justify-center py-32 text-red-500 text-lg font-medium">{cartError}</div>
        ) : cartItems.length === 0 ? (
          <div className="bg-neutral-50 rounded-xl shadow p-12 text-center border border-neutral-200">
            <p className="text-xl text-neutral-500 mb-8 font-normal">Your cart is empty</p>
            <Link
              to="/products"
              className="inline-block px-6 py-2.5 bg-black text-white rounded-full shadow hover:bg-neutral-900 transition-colors text-base font-medium border border-black/10"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Cart Items */}
            <div className="lg:w-2/3 space-y-6">
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-5 sm:p-6 rounded-xl shadow border border-neutral-200 gap-6 group hover:shadow-md transition-shadow duration-200"
                >
                  {/* Product Image */}
                  <Link 
                    to={`/products/${product.slug || product.id}`}
                    className="flex-shrink-0 w-full sm:w-auto"
                  >
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${product.images?.[0]?.startsWith('/') ? '' : '/'}${product.images?.[0] || ''}`}
                      alt={product.name}
                      className="w-full sm:w-20 h-20 object-cover rounded-lg border border-neutral-200 shadow-sm group-hover:scale-105 transition-transform duration-300"
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
                      <h3 className="font-sans text-lg font-semibold text-neutral-900 mb-1 tracking-tight">{product.name}</h3>
                    </Link>
                    {/* Product Variant Info */}
                    {product.variant && (
                      <div className="text-xs text-neutral-500 mb-1">Variant: {product.variant}</div>
                    )}
                    {/* Estimated Delivery */}
                    <div className="text-xs text-emerald-600 mb-2">Estimated Delivery: {getEstimatedDelivery()}</div>
                    <p className="text-sm text-neutral-500 mb-2">{formatCurrency(product.price)}</p>
                    {/* Save for Later / Wishlist */}
                    <button
                      className="text-xs text-indigo-500 hover:underline mb-2"
                      onClick={() => saveForLaterHandler(product.id)}
                      type="button"
                    >
                      Save for Later
                    </button>
                    {/* Mobile-only quantity controls */}
                    <div className="sm:hidden flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantityHandler(product.id, -1)}
                          className={`p-1 rounded-full border border-neutral-200 ${quantity <= 1 ? 'text-neutral-300' : 'text-neutral-700 hover:bg-neutral-100'}`}
                          disabled={quantity <= 1 || isUpdating}
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-6 text-center text-base font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantityHandler(product.id, 1)}
                          className="p-1 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                          disabled={isUpdating}
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItemHandler(product.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                        disabled={isUpdating}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Desktop quantity controls */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantityHandler(product.id, -1)}
                      className={`p-2 rounded-full border border-neutral-200 ${quantity <= 1 ? 'text-neutral-300' : 'text-neutral-700 hover:bg-neutral-100'}`}
                      disabled={quantity <= 1 || isUpdating}
                    >
                      <FiMinus size={18} />
                    </button>
                    <span className="w-10 text-center text-lg font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantityHandler(product.id, 1)}
                      className="p-2 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                      disabled={isUpdating}
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:block w-24 text-right font-semibold text-base text-neutral-900">
                    {formatCurrency(parseFloat(product.price) * quantity)}
                  </div>

                  {/* Desktop remove */}
                  <button
                    onClick={() => removeItemHandler(product.id)}
                    className="hidden sm:block text-neutral-400 hover:text-red-500 transition-colors"
                    disabled={isUpdating}
                  >
                    <FiTrash2 size={20} />
                  </button>

                  {/* Mobile price */}
                  <div className="sm:hidden w-full text-right font-semibold text-base text-neutral-900 mt-2">
                    {formatCurrency(parseFloat(product.price) * quantity)}
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <div className="text-right mt-2">
                <button
                  onClick={clearCartHandler}
                  className="text-base text-neutral-400 hover:text-red-500 transition-colors font-normal border-b border-transparent hover:border-red-400 pb-0.5"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-neutral-50 p-6 rounded-xl shadow border border-neutral-200 sticky top-4 sm:top-8 flex flex-col gap-6">
                <h2 className="text-xl font-sans font-semibold text-neutral-900 mb-2 pb-3 border-b">Order Summary</h2>
                {/* Promo Code Input */}
                <form className="flex gap-2 mb-4" onSubmit={applyPromoCodeHandler}>
                  <input
                    type="text"
                    placeholder="Promo code"
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-900 transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {promoMessage && <div className={`text-sm mb-2 ${promoSuccess ? 'text-emerald-600' : 'text-red-500'}`}>{promoMessage}</div>}
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between text-base">
                    <span className="text-neutral-500">Subtotal <span className="font-normal">({cartCount} items)</span></span>
                    <span className="font-semibold text-neutral-900">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-sm">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-sm">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="flex justify-between border-t pt-4 text-lg font-bold">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full mt-2 bg-black text-white text-center py-3 rounded-full hover:bg-neutral-900 transition-colors text-base font-semibold tracking-wide shadow border border-black/10"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Trust Badges */}
      <div className="max-w-4xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-6 border-t pt-8">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <img src="/images/hero-2.jpg" alt="Secure Payment" className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
          Secure Payment
        </div>
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <img src="/images/hero-3.jpg" alt="Fast Delivery" className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
          Fast Delivery
        </div>
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <img src="/images/smartwatch.jpg" alt="Satisfaction Guarantee" className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
          Satisfaction Guarantee
        </div>
      </div>
      {/* Recommended Products */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {/* Example recommended products, replace with real data */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow p-4 flex flex-col items-center text-center">
            <img src="/images/hero-2.jpg" alt="Recommended 1" className="w-24 h-24 object-cover rounded-lg mb-3" />
            <h3 className="font-medium text-base mb-1">Signature Collection</h3>
            <p className="text-sm text-neutral-500 mb-2">Handcrafted luxury essentials.</p>
            <Link to="/products/1" className="inline-block px-4 py-2 bg-black text-white rounded-full text-xs font-medium hover:bg-neutral-900 transition">View Product</Link>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl shadow p-4 flex flex-col items-center text-center">
            <img src="/images/tshirt-blue.jpg" alt="Recommended 2" className="w-24 h-24 object-cover rounded-lg mb-3" />
            <h3 className="font-medium text-base mb-1">Minimalist Edit</h3>
            <p className="text-sm text-neutral-500 mb-2">Sleek, versatile, everyday elegance.</p>
            <Link to="/products/2" className="inline-block px-4 py-2 bg-black text-white rounded-full text-xs font-medium hover:bg-neutral-900 transition">View Product</Link>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl shadow p-4 flex flex-col items-center text-center">
            <img src="/images/smartwatch.jpg" alt="Recommended 3" className="w-24 h-24 object-cover rounded-lg mb-3" />
            <h3 className="font-medium text-base mb-1">Tech Essentials</h3>
            <p className="text-sm text-neutral-500 mb-2">Smart accessories for a connected lifestyle.</p>
            <Link to="/products/3" className="inline-block px-4 py-2 bg-black text-white rounded-full text-xs font-medium hover:bg-neutral-900 transition">View Product</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;