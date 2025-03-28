import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/authContext.jsx' // To ensure user is logged in (handled by ProtectedRoute)
import { createOrderApi } from '../services/orderApi.js'
import Spinner from '../components/common/Spinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const CheckoutPage = () => {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth(); // Get user info if needed (e.g., prefill address)
  const navigate = useNavigate();

  // State for shipping address form
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !loading) { // Don't redirect if placing order
      console.log("Cart is empty, redirecting...");
      navigate('/cart');
    }
  }, [cartItems, navigate, loading]);

  // Handle input changes for shipping address
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Handle order placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault(); // Prevent default form submission if wrapped in form
    setError(null);
    setLoading(true);

    // Basic Address Validation (add more robust validation as needed)
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode || !shippingAddress.country) {
         setError("Please fill in all required shipping address fields.");
         setLoading(false);
         return;
    }


    // Prepare order data payload
    const orderData = {
      // Map cart items to the structure expected by the backend [{ productId, quantity }]
      orderItems: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      shippingAddress: shippingAddress,
      // Optionally add total from cartTotal for backend verification, but backend MUST recalculate
      // clientTotal: cartTotal
    };

    try {
      const response = await createOrderApi(orderData);
      // Order created successfully!
      console.log('Order Response:', response);
      clearCart(); // Clear the cart in frontend state & localStorage
      // Redirect to an order success page, passing the new order ID
      navigate(`/order-success/${response.data.id}`); // Assuming backend returns { data: { id: '...' } }

    } catch (err) {
      console.error("Order placement failed:", err);
      setError(err.error || err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

      {error && <ErrorMessage message={error} />}

      <div className="flex flex-col lg:flex-row gap-12">

        {/* Shipping Address Form */}
        <div className="lg:w-1/2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-5 border-b pb-3">Shipping Address</h2>
          <form className="space-y-4" onSubmit={handlePlaceOrder}>
            {/* Street Address */}
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input
                type="text" name="street" id="street" required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={shippingAddress.street} onChange={handleInputChange}
              />
            </div>
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text" name="city" id="city" required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={shippingAddress.city} onChange={handleInputChange}
              />
            </div>
            {/* State / Province */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
              <input
                type="text" name="state" id="state"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={shippingAddress.state} onChange={handleInputChange}
              />
            </div>
            {/* Zip / Postal Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">Zip / Postal Code *</label>
              <input
                type="text" name="zipCode" id="zipCode" required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={shippingAddress.zipCode} onChange={handleInputChange}
              />
            </div>
            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <input // Could be a dropdown select later
                type="text" name="country" id="country" required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={shippingAddress.country} onChange={handleInputChange}
              />
            </div>
             {/* Placeholder for Payment Method (since we skipped gateway integration) */}
              <div className="pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Method</h3>
                  <div className="p-4 border rounded-md bg-gray-50 text-gray-600">
                      Payment details will be handled by the chosen provider (e.g., Chapa). Confirmation assumes payment success for now.
                      {/* When implementing Stripe/Chapa: This is where Stripe Elements or Chapa button/redirect logic would go */}
                  </div>
              </div>

            {/* Place Order Button - now part of the form */}
             <button
                type="submit" // Submit the form
                disabled={loading || cartItems.length === 0}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition duration-300 disabled:opacity-60 flex items-center justify-center"
            >
                {loading ? <Spinner /> : 'Place Order'}
            </button>

          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/2">
           <div className="bg-gray-100 p-6 rounded-lg shadow-md sticky top-24"> {/* Sticky summary */}
             <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Order Summary</h2>
             {/* Item List */}
             <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2"> {/* Scrollable items */}
                 {cartItems.map(({ product, quantity }) => (
                     <div key={product.id} className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-2">
                             <img src={product.images?.[0] || '/placeholder-image.jpg'} alt={product.name} className="w-10 h-10 object-cover rounded" />
                             <span>{product.name} <span className="text-gray-500">x {quantity}</span></span>
                         </div>
                         <span>{formatCurrency(parseFloat(product.price) * quantity)}</span>
                     </div>
                 ))}
             </div>

             {/* Totals */}
             <div className="space-y-3 mb-6 border-t pt-4">
               <div className="flex justify-between">
                 <span>Subtotal ({cartCount} items)</span>
                 <span className="font-semibold">{formatCurrency(cartTotal)}</span>
               </div>
               <div className="flex justify-between">
                 <span>Shipping</span>
                 <span className="text-gray-600">FREE (Promotional)</span> {/* Placeholder */}
               </div>
                <div className="flex justify-between">
                 <span>Taxes</span>
                 <span className="text-gray-600">Calculated at next step</span> {/* Placeholder */}
               </div>
             </div>
             <div className="flex justify-between border-t pt-4 font-bold text-xl">
               <span>Total</span>
                {/* // Use cartTotal directly for now, adjust later if shipping/taxes added */}
               <span>{formatCurrency(cartTotal)}</span>
             </div>

              {/* Button is moved inside the form */}
           </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;