import React, { useEffect, useState } from 'react';
import { fetchMyOrdersApi } from '../services/orderApi';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Link } from 'react-router-dom';
import { formatETB } from '../utils/utils';
import { FiChevronRight, FiPackage, FiAlertCircle } from 'react-icons/fi';

const getStatusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-yellow-100 text-yellow-800';
    case 'delivered': return 'bg-emerald-100 text-emerald-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchMyOrdersApi();
        setOrders(res.data || []);
      } catch (err) {
        setError(err.error || err.message || 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-0 pt-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-10 text-center text-neutral-900 tracking-tight">My Orders</h1>
        {loading && <Spinner />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32">
            <FiAlertCircle className="w-16 h-16 text-gray-300 mb-6" />
            <p className="text-gray-400 text-xl font-medium">You have not placed any orders yet.</p>
            <Link to="/products" className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition">Shop Now</Link>
          </div>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-indigo-50 p-3 rounded-full">
                    <FiPackage className="text-indigo-600 w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-neutral-900 mb-1">Order #{order.id}</div>
                    <div className="text-sm text-neutral-500 mb-1">{new Date(order.created_at || order.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-neutral-700">Total: <span className="font-medium">{formatETB(order.totalAmount || order.total_amount || 0)}</span></div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>{order.status || 'N/A'}</span>
                  <Link to={`/order-success/${order.id}`} className="flex items-center gap-1 text-indigo-600 hover:underline text-sm font-medium group">
                    View Details <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
