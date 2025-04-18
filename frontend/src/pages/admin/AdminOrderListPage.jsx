import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// Ensure this import path and extension are correct
import { fetchAdminOrders } from '../../services/adminApi.jsx'; // Try adding .jsx explicitly
import Spinner from '../../components/common/Spinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { FiSearch, FiEye, FiFilter, FiAlertCircle, FiChevronDown } from 'react-icons/fi';

// Helper to format currency (reuse if available globally)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Helper for status badge styling
const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'shipped': return 'bg-yellow-100 text-yellow-800';
        case 'delivered': return 'bg-emerald-100 text-emerald-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const orderStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Pending']; // Example

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchAdminOrders({
          page: currentPage,
          search: searchTerm,
          status: statusFilter,
          limit: 10,
        });

        setOrders(response.data?.orders || []);
        setTotalPages(response.data?.totalPages || 1);
        setTotalOrders(response.data?.totalOrders || 0);

      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load orders.';
        setError(errorMessage);
        console.error("Error loading orders:", err);
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    if (statusFilter) {
      params.set('status', statusFilter);
    } else {
      params.delete('status');
    }
    setSearchParams(params, { replace: true });
  }, [searchTerm, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', newPage.toString());
        return newParams;
      }, { replace: true });
    }
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (newSearchTerm) {
            newParams.set('search', newSearchTerm);
        } else {
            newParams.delete('search');
        }
        newParams.set('page', '1');
        return newParams;
      }, { replace: true });
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        if (newStatus) {
            newParams.set('status', newStatus);
        } else {
            newParams.delete('status');
        }
        newParams.set('page', '1');
        return newParams;
      }, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Loading orders...' : `${totalOrders} order${totalOrders !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow sm:max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search by ID or Customer..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm bg-white"
          >
            <option value="">All Statuses</option>
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12 min-h-[200px]">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            <FiAlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-4" />
            <p className="font-medium">No orders found</p>
            {(searchTerm || statusFilter) && <p className="text-sm mt-1">Try adjusting your search or filters.</p>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.order_number || order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{order.customer?.name || order.customer_email || 'N/A'}</div>
                        <div className="text-sm text-slate-500 md:hidden mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden md:table-cell">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                          {order.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(order.total_amount || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                          title="View Details"
                        >
                          <FiEye size={16} />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-4 sm:px-6 border-t border-slate-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrderListPage;
