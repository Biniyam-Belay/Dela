import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/authContext.jsx';
import { createOrder, selectOrderStatus, selectOrderError } from '../store/orderSlice';
import Spinner from '../components/common/Spinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { FiChevronLeft } from 'react-icons/fi';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const CheckoutPage = () => {
  const { clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orderStatus = useSelector(selectOrderStatus);
  const orderError = useSelector(selectOrderError);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ethiopia', // Default for Ethiopian context
    phone: ''
  });

  const [error, setError] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Get cart data from Redux
  const cartItems = useSelector(state => state.cart.items);
  // Robust price calculation in case state.cart.total is not correct
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.product.price) * Number(item.quantity)), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Prefill user data if available
  useEffect(() => {
    if (user?.address) {
      setShippingAddress(prev => ({
        ...prev,
        ...user.address,
        country: user.address.country || 'Ethiopia'
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setError(null);
    setIsPlacingOrder(true);

    // Enhanced validation
    const requiredFields = ['firstName', 'street', 'city', 'zipCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsPlacingOrder(false);
      return;
    }

    const orderData = {
      orderItems: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress,
      totalAmount: cartTotal
    };

    console.log('Submitting orderData:', orderData);

    dispatch(createOrder(orderData))
      .unwrap()
      .then((order) => {
        clearCart();
        navigate(`/order-success/${order.id}`);
      })
      .catch((err) => {
        setError(err || 'Failed to place order. Please try again.');
      })
      .finally(() => setIsPlacingOrder(false));
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-0 pt-28">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-neutral-500 hover:text-black mb-8 transition-colors text-base font-normal border-b border-transparent hover:border-black pb-0.5"
        >
          <FiChevronLeft className="mr-2" />
          Back to Cart
        </button>
        <h1 className="text-3xl sm:text-4xl font-sans font-semibold text-neutral-900 tracking-tight mb-10">Checkout</h1>
        {error && <ErrorMessage message={error} className="mb-6" />}
        {orderError && <ErrorMessage message={orderError} className="mb-6" />}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column - Shipping */}
          <div className="lg:w-2/3 space-y-8">
            <div className="bg-white rounded-xl shadow p-6 sm:p-8 border border-neutral-200">
              <h2 className="text-xl font-sans font-semibold text-neutral-900 mb-6">Shipping Information</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingAddress.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingAddress.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, Suite, etc.</label>
                  <input
                    type="text"
                    name="apartment"
                    value={shippingAddress.apartment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Region</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                    required
                  >
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                    required
                  />
                </div>
              </form>
            </div>
          </div>
          {/* Right Column - Order Summary */}
          <div className="lg:w-[40%] min-w-[320px]">
            <div className="bg-neutral-50 rounded-xl shadow p-6 sm:p-8 border border-neutral-200 sticky top-8 flex flex-col gap-6">
              <h2 className="text-xl font-sans font-semibold text-neutral-900 mb-6">Order Summary</h2>
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={
                            product.images?.[0]
                              ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}`
                              : '/placeholder-image.jpg' // Use placeholder if no image path
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            // Prevent infinite loop if placeholder itself fails
                            if (e.target.src !== '/placeholder-image.jpg') { 
                              e.target.onerror = null; 
                              e.target.src = '/placeholder-image.jpg';
                            }
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(product.price * quantity)}</p>
                  </div>
                ))}
              </div>
              {/* Order Totals */}
              <div className="space-y-3 border-t border-neutral-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-600">Calculated at checkout</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={orderStatus === 'loading' || isPlacingOrder || cartItems.length === 0}
                className={`w-full mt-6 py-3 rounded-full text-white font-semibold flex items-center justify-center gap-2 ${orderStatus === 'loading' || isPlacingOrder ? 'bg-gray-400' : 'bg-black hover:bg-neutral-900'} transition-colors text-base shadow border border-black/10`}
              >
                {(orderStatus === 'loading' || isPlacingOrder) ? (
                  <>
                    <Spinner size="sm" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(cartTotal)}`
                )}
              </button>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default CheckoutPage;