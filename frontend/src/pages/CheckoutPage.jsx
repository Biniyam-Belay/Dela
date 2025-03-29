import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/authContext.jsx';
import { createOrderApi } from '../services/orderApi.js';
import Spinner from '../components/common/Spinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { FiChevronLeft } from 'react-icons/fi';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const CheckoutPage = () => {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePayment, setActivePayment] = useState('chapa'); // Default payment method

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [cartItems, navigate, loading]);

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

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Enhanced validation
    const requiredFields = ['firstName', 'street', 'city', 'zipCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    const orderData = {
      orderItems: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress,
      paymentMethod: activePayment,
      totalAmount: cartTotal
    };

    try {
      const response = await createOrderApi(orderData);
      clearCart();
      navigate(`/order-success/${response.data.id}`);
    } catch (err) {
      console.error('Order error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-black mb-6 transition-colors"
        >
          <FiChevronLeft className="mr-2" />
          Back to Cart
        </button>

        <h1 className="text-3xl font-light text-gray-900 mb-8">Checkout</h1>

        {error && <ErrorMessage message={error} className="mb-6" />}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Shipping and Payment */}
          <div className="lg:w-2/3 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Shipping Information</h2>
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

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Payment Method</h2>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setActivePayment('chapa')}
                  className={`w-full text-left p-4 border rounded-lg flex items-center gap-4 ${
                    activePayment === 'chapa' ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="h-10 w-16 bg-blue-50 rounded flex items-center justify-center">
                    <span className="font-medium text-blue-600">Chapa</span>
                  </div>
                  <span>Pay with Chapa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePayment('telebirr')}
                  className={`w-full text-left p-4 border rounded-lg flex items-center gap-4 ${
                    activePayment === 'telebirr' ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="h-10 w-16 bg-green-50 rounded flex items-center justify-center">
                    <span className="font-medium text-green-600">Telebirr</span>
                  </div>
                  <span>Pay with Telebirr</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>
              
              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${
                            product.images?.[0]?.startsWith('/') ? '' : '/'
                          }${product.images?.[0] || ''}`}
                          alt={product.name}
                          className="h-full w-full object-cover"
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
              <div className="space-y-3 border-t border-gray-200 pt-4">
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
                <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
                className={`w-full mt-6 py-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
                  loading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
                } transition-colors`}
              >
                {loading ? (
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
    </div>
  );
};

export default CheckoutPage;