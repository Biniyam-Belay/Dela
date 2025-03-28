import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderByIdApi } from '../services/orderApi'; // Optional: Fetch order details to display
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccessPage = () => {
  const { orderId } = useParams(); // Get order ID from URL parameter
  // Optional: Fetch order details to show more info
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   useEffect(() => {
       const loadOrder = async () => {
            if (!orderId) {
                setError("No order ID provided.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await fetchOrderByIdApi(orderId);
                setOrder(response.data);
            } catch (err) {
                setError(err.error || err.message || "Failed to fetch order details.");
            } finally {
                setLoading(false);
            }
       };
       loadOrder();
   }, [orderId]);


  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You For Your Order!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully. Your order details are below.
        </p>

         {loading && <Spinner />}
         {error && <ErrorMessage message={error} />}

         {!loading && order && (
            <div className="text-left bg-gray-50 p-4 rounded border mb-6">
                <p className="mb-2"><strong>Order ID:</strong> {order.id}</p>
                <p className="mb-2"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="mb-2"><strong>Total Amount:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.totalAmount)}</p>
                {/* Add more details like shipping address if needed */}
                <p className="mb-2"><strong>Status:</strong> <span className="font-semibold capitalize">{order.status.toLowerCase()}</span></p>
            </div>
         )}
         {!loading && !order && !error && (
             <p className="mb-6">Order ID: <span className="font-semibold">{orderId}</span></p>
         )}


        <div className="space-y-3">
           <Link
              to="/profile" // Link to profile where order history might be
              className="inline-block w-full px-6 py-2 border border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-50 transition duration-200"
           >
              View Order History
           </Link>
           <Link
              to="/products"
              className="inline-block w-full px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-200"
           >
              Continue Shopping
           </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;