import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderByIdApi } from '../services/orderApi'; // Optional: Fetch order details to display
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FaCheckCircle } from 'react-icons/fa';
import { formatETB } from '../utils/utils'; // Import formatETB utility
import { useDispatch } from 'react-redux';
import { clearCart, clearLocalCartAndState } from '../store/cartSlice';

const OrderSuccessPage = () => {
  const { orderId } = useParams(); // Get order ID from URL parameter
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('No order ID provided.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetchOrderByIdApi(orderId);
        setOrder(response.data);
      } catch (err) {
        setError(err.error || err.message || 'Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (!loading && order && !error) {
      // First clear backend cart, then local as fallback if needed
      dispatch(clearCart())
        .unwrap()
        .catch(() => dispatch(clearLocalCartAndState()));
    }
  }, [loading, order, error, dispatch]);

  return (
    <div className="container mx-auto px-4 py-12 pt-28 text-center">
      {/* Order Success Card */}
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl space-y-6">
        {/* Success Icon */}
        <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6" />

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800">Thank You For Your Order!</h1>
        <p className="text-gray-600">
          Your order has been placed successfully. Here are the details:
        </p>

        {/* Loading State */}
        {loading && <Spinner />}

        {/* Error State */}
        {error && <ErrorMessage message={error} />}

        {/* Order Details */}
        {!loading && order && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-3 text-left">
            <p>
              <strong>Order ID:</strong> <span className="font-medium">{order.id}</span>
            </p>
            <p>
              <strong>Date:</strong>{' '}
              <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
            </p>
            <p>
              <strong>Total Amount:</strong>{' '}
              <span className="font-medium">{formatETB(order.totalAmount)}</span>
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`font-semibold capitalize ${getStatusColor(order.status)}`}>
                {order.status.toLowerCase()}
              </span>
            </p>
          </div>
        )}

        {/* Fallback Order ID Display */}
        {!loading && !order && !error && (
          <p className="mb-6">
            Order ID: <span className="font-semibold">{orderId}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 mt-6">
          <Link
            to="/orders"
            className="inline-block w-full px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-md hover:bg-indigo-50 transition duration-300"
          >
            View Order History
          </Link>
          <Link
            to="/products"
            className="inline-block w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper: Get Status Color Based on Order Status
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'text-yellow-600';
    case 'shipped':
      return 'text-blue-600';
    case 'delivered':
      return 'text-green-600';
    case 'cancelled':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export default OrderSuccessPage;