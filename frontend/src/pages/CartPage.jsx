import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiTag, FiPackage } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet';
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
import { addToWishlist } from '../store/wishlistSlice';
import { formatETB } from "../utils/utils";
import { getImageUrl } from '../utils/imageUrl';

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

  // Group cart items by collection
  const groupedCartItems = useMemo(() => {
    const collections = {};
    const individualItems = [];

    console.log('Raw cart items:', cartItems);

    cartItems.forEach(item => {
      // Check for collection_id (from backend) - this is the primary field
      const collectionId = item.collection_id;
      const hasCollection = collectionId !== null && 
                           collectionId !== undefined && 
                           collectionId !== '' &&
                           typeof collectionId === 'string';
      
      console.log(`Item ${item.product?.name}:`, {
        collection_id: item.collection_id,
        hasCollection,
        finalCollectionId: collectionId
      });
      
      if (hasCollection) {
        // This item belongs to a collection
        if (!collections[collectionId]) {
          collections[collectionId] = {
            id: collectionId,
            name: item.collectionName || item.product?.collection_name || `Collection ${collectionId.slice(0, 8)}`,
            sellerId: item.sellerId || item.product?.seller_id,
            sellerName: item.sellerName || item.product?.seller_name || 'Unknown Seller',
            description: item.collectionDescription || item.product?.collection_description,
            items: [],
            totalPrice: 0,
            totalQuantity: 0
          };
        }
        collections[collectionId].items.push(item);
        collections[collectionId].totalPrice += parseFloat(item.product.price) * item.quantity;
        collections[collectionId].totalQuantity += item.quantity;
      } else {
        // This is an individual item (no collection association)
        console.log(`Adding as individual item: ${item.product?.name}`);
        individualItems.push(item);
      }
    });

    console.log('Final grouped cart items:', {
      collections: Object.values(collections),
      individualItems,
      totalCollections: Object.keys(collections).length,
      totalIndividualItems: individualItems.length
    });

    return {
      collections: Object.values(collections),
      individualItems
    };
  }, [cartItems]);

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

  const getEstimatedDelivery = () => {
    // Placeholder logic for estimated delivery
    return '3-5 business days';
  };

  const saveForLaterHandler = (productId) => {
    if (isUpdating) return;
    setIsUpdating(true);
    // Find the product in cartItems
    const cartItem = cartItems.find(item => item.product.id === productId);
    if (!cartItem) {
      toast.error('Item not found in cart.');
      setIsUpdating(false);
      return;
    }
    // Remove from cart, then add to wishlist
    dispatch(removeItemOptimistic(productId));
    dispatch(removeItem(productId))
      .unwrap()
      .then(() => {
        dispatch(addToWishlist(productId));
        toast.success('Item saved for later!');
      })
      .catch((err) => {
        toast.error(err || 'Failed to save for later');
        dispatch(fetchCart());
      })
      .finally(() => setIsUpdating(false));
  };

  const saveCollectionForLaterHandler = (collection) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    // Remove all items from the collection and add to wishlist
    const removePromises = collection.items.map(item => {
      dispatch(removeItemOptimistic(item.product.id));
      return dispatch(removeItem(item.product.id)).unwrap();
    });

    Promise.all(removePromises)
      .then(() => {
        // Add all collection items to wishlist
        collection.items.forEach(item => {
          dispatch(addToWishlist(item.product.id));
        });
        toast.success('Collection saved for later!');
      })
      .catch((err) => {
        toast.error(err || 'Failed to save collection for later');
        dispatch(fetchCart());
      })
      .finally(() => setIsUpdating(false));
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
      <Helmet>
        <title>Your Cart | SuriAddis</title>
        <meta name="description" content="View and manage your shopping cart. Update quantities, remove items, and proceed to checkout on SuriAddis." />
      </Helmet>
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
              {/* Collections */}
              {groupedCartItems.collections.map((collection) => (
                <div key={collection.id} className="border-2 border-blue-100 rounded-xl p-6 bg-blue-50/30">
                  {/* Collection Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiPackage className="text-blue-600 w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-neutral-900">{collection.name}</h2>
                        <p className="text-sm text-neutral-600">by {collection.sellerName}</p>
                        {collection.description && (
                          <p className="text-xs text-neutral-500 mt-1">{collection.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600">{collection.totalQuantity} items</p>
                      <p className="text-lg font-semibold text-neutral-900">{formatETB(collection.totalPrice)}</p>
                    </div>
                  </div>

                  {/* Collection Items */}
                  <div className="space-y-4">
                    {collection.items.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-neutral-200 gap-4 group hover:shadow-md transition-shadow duration-200"
                      >
                        {/* Product Image */}
                        <Link
                          to={`/products/${product.slug || product.id}`}
                          className="flex-shrink-0 w-full sm:w-auto"
                        >
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.name}
                            className="w-full sm:w-16 h-16 object-cover rounded-lg border border-neutral-200 shadow-sm group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
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
                            <h3 className="font-sans text-base font-semibold text-neutral-900 mb-1 tracking-tight">{product.name}</h3>
                          </Link>
                          
                          {/* Product Variant Info */}
                          {product.variant && (
                            <div className="text-xs text-neutral-500 mb-1">Variant: {product.variant}</div>
                          )}
                          <p className="text-sm text-neutral-600 mb-2">{formatETB(product.price)} each</p>
                          
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
                            <FiMinus size={16} />
                          </button>
                          <span className="w-8 text-center text-base font-medium">{quantity}</span>
                          <button
                            onClick={() => updateQuantityHandler(product.id, 1)}
                            className="p-2 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                            disabled={isUpdating}
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="hidden sm:block w-20 text-right font-semibold text-base text-neutral-900">
                          {formatETB(parseFloat(product.price) * quantity)}
                        </div>

                        {/* Desktop remove */}
                        <button
                          onClick={() => removeItemHandler(product.id)}
                          className="hidden sm:block text-neutral-400 hover:text-red-500 transition-colors"
                          disabled={isUpdating}
                        >
                          <FiTrash2 size={18} />
                        </button>

                        {/* Mobile price */}
                        <div className="sm:hidden w-full text-right font-semibold text-base text-neutral-900 mt-2">
                          {formatETB(parseFloat(product.price) * quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Collection Footer */}
                  <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                      onClick={() => saveCollectionForLaterHandler(collection)}
                      disabled={isUpdating}
                    >
                      Save Collection for Later
                    </button>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600">Collection Total:</p>
                      <p className="text-lg font-bold text-neutral-900">{formatETB(collection.totalPrice)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Individual Items */}
              {groupedCartItems.individualItems.length > 0 && (
                <div className="border border-neutral-200 rounded-xl p-6 bg-white">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center gap-2 pb-4 border-b border-neutral-200">
                    <FiTag className="text-neutral-500" />
                    Individual Items ({groupedCartItems.individualItems.length})
                  </h2>
                  
                  <div className="space-y-4">
                    {groupedCartItems.individualItems.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all duration-200 gap-4"
                      >
                        {/* Product Image */}
                        <Link
                          to={`/products/${product.slug || product.id}`}
                          className="flex-shrink-0 w-full sm:w-auto"
                        >
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.name}
                            className="w-full sm:w-16 h-16 object-cover rounded-lg border border-neutral-200 shadow-sm hover:scale-105 transition-transform duration-300"
                            loading="lazy"
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
                            <h3 className="font-medium text-base text-neutral-900 mb-1">{product.name}</h3>
                          </Link>
                          
                          <p className="text-sm text-neutral-600 mb-2">{formatETB(product.price)} each</p>
                          
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
                            <FiMinus size={16} />
                          </button>
                          <span className="w-8 text-center text-base font-medium">{quantity}</span>
                          <button
                            onClick={() => updateQuantityHandler(product.id, 1)}
                            className="p-2 rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                            disabled={isUpdating}
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="hidden sm:block w-20 text-right font-semibold text-base text-neutral-900">
                          {formatETB(parseFloat(product.price) * quantity)}
                        </div>

                        {/* Desktop remove */}
                        <button
                          onClick={() => removeItemHandler(product.id)}
                          className="hidden sm:block text-neutral-400 hover:text-red-500 transition-colors"
                          disabled={isUpdating}
                        >
                          <FiTrash2 size={18} />
                        </button>

                        {/* Mobile price */}
                        <div className="sm:hidden w-full text-right font-semibold text-base text-neutral-900 mt-2">
                          {formatETB(parseFloat(product.price) * quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Individual Items Actions */}
                  <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
                    <button
                      className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                      onClick={() => {
                        groupedCartItems.individualItems.forEach(item => {
                          saveForLaterHandler(item.product.id);
                        });
                      }}
                      disabled={isUpdating}
                    >
                      Save All for Later
                    </button>
                    <div className="text-right">
                      <p className="text-sm text-neutral-600">Items Total:</p>
                      <p className="text-lg font-bold text-neutral-900">
                        {formatETB(groupedCartItems.individualItems.reduce((total, item) => 
                          total + (parseFloat(item.product.price) * item.quantity), 0
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clear Cart */}
              <div className="text-right mt-8">
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
                
                {/* Summary Breakdown */}
                <div className="space-y-3 text-sm">
                  {groupedCartItems.collections.length > 0 && (
                    <div>
                      <h3 className="font-medium text-neutral-700 mb-2">Collections:</h3>
                      {groupedCartItems.collections.map((collection) => (
                        <div key={collection.id} className="flex justify-between items-center py-1 px-3 bg-blue-50 rounded-lg mb-2">
                          <span className="text-neutral-600">{collection.name} ({collection.totalQuantity} items)</span>
                          <span className="font-medium text-neutral-900">{formatETB(collection.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {groupedCartItems.individualItems.length > 0 && (
                    <div>
                      <h3 className="font-medium text-neutral-700 mb-2">Individual Items:</h3>
                      <div className="flex justify-between items-center py-1 px-3 bg-neutral-100 rounded-lg">
                        <span className="text-neutral-600">{groupedCartItems.individualItems.length} items</span>
                        <span className="font-medium text-neutral-900">
                          {formatETB(groupedCartItems.individualItems.reduce((total, item) => 
                            total + (parseFloat(item.product.price) * item.quantity), 0
                          ))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

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
                    <span className="font-semibold text-neutral-900">{formatETB(cartTotal)}</span>
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
                  <span>{formatETB(cartTotal)}</span>
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
      <div className="max-w-4xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-6 border-t pt-8" aria-label="Trust Badges">
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <img src="/images/hero-2.jpg" alt="Secure Payment badge" className="w-8 h-8 rounded-full object-cover border border-neutral-200" loading="lazy" />
          Secure Payment
        </div>
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <img src="/images/hero-3.jpg" alt="Fast Delivery badge" className="w-8 h-8 rounded-full object-cover border border-neutral-200" loading="lazy" />
          Fast Delivery
        </div>
        <div className="flex items-center gap-2 text-neutral-500 text-sm">
          <img src="/images/smartwatch.jpg" alt="Satisfaction Guarantee badge" className="w-8 h-8 rounded-full object-cover border border-neutral-200" loading="lazy" />
          Satisfaction Guarantee
        </div>
      </div>
      {/* Recommended Products */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          {/* Example recommended products, replace with real data */}
          <div className="bg-white border border-neutral-200 rounded-xl shadow p-4 flex flex-col items-center text-center">
            <img src="/images/hero-2.jpg" alt="Signature Collection recommended product" className="w-24 h-24 object-cover rounded-lg mb-3" loading="lazy" />
            <h3 className="font-medium text-base mb-1">Signature Collection</h3>
            <p className="text-sm text-neutral-500 mb-2">Handcrafted luxury essentials.</p>
            <Link to="/products/1" className="inline-block px-4 py-2 bg-black text-white rounded-full text-xs font-medium hover:bg-neutral-900 transition">View Product</Link>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl shadow p-4 flex flex-col items-center text-center">
            <img src="/images/tshirt-blue.jpg" alt="Minimalist Edit recommended product" className="w-24 h-24 object-cover rounded-lg mb-3" loading="lazy" />
            <h3 className="font-medium text-base mb-1">Minimalist Edit</h3>
            <p className="text-sm text-neutral-500 mb-2">Sleek, versatile, everyday elegance.</p>
            <Link to="/products/2" className="inline-block px-4 py-2 bg-black text-white rounded-full text-xs font-medium hover:bg-neutral-900 transition">View Product</Link>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl shadow p-4 flex flex-col items-center text-center">
            <img src="/images/smartwatch.jpg" alt="Tech Essentials recommended product" className="w-24 h-24 object-cover rounded-lg mb-3" loading="lazy" />
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