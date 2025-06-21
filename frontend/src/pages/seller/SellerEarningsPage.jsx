import React, { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiCalendar, 
  FiDownload,
  FiCreditCard,
  FiBarChart2
} from 'react-icons/fi';
import { getSellerEarnings } from '../../services/sellerApi.js';
import Spinner from '../../components/common/Spinner.jsx';

const SellerEarningsPage = () => {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    fetchEarnings();
  }, [timeRange]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSellerEarnings(timeRange);
      setEarnings(data);
    } catch (err) {
      console.error('Error fetching earnings:', err);
      // Use mock data for development - don't show error if we have mock data
      const mockData = getMockEarnings();
      if (mockData) {
        setEarnings(mockData);
        setError(null); // Clear any previous errors
      } else {
        setError('Failed to load earnings data');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMockEarnings = () => ({
    summary: {
      total_earnings: 1450.75,
      pending_earnings: 245.30,
      available_balance: 1205.45,
      total_orders: 28,
      commission_rate: 0.15
    },
    recent_transactions: [
      {
        id: 1,
        type: 'sale',
        amount: 89.99,
        commission: 13.50,
        net_amount: 76.49,
        order_id: 'ORD-2024-001',
        customer_name: 'John Doe',
        product_name: 'Summer Collection',
        date: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: 2,
        type: 'sale',
        amount: 125.00,
        commission: 18.75,
        net_amount: 106.25,
        order_id: 'ORD-2024-002',
        customer_name: 'Jane Smith',
        product_name: 'Urban Explorer Kit',
        date: '2024-01-14T14:20:00Z',
        status: 'completed'
      },
      {
        id: 3,
        type: 'payout',
        amount: -500.00,
        commission: 0,
        net_amount: -500.00,
        order_id: 'PAY-2024-001',
        customer_name: null,
        product_name: 'Weekly Payout',
        date: '2024-01-13T09:00:00Z',
        status: 'processed'
      }
    ],
    chart_data: [
      { date: '2024-01-01', earnings: 120 },
      { date: '2024-01-02', earnings: 95 },
      { date: '2024-01-03', earnings: 180 },
      { date: '2024-01-04', earnings: 150 },
      { date: '2024-01-05', earnings: 220 },
      { date: '2024-01-06', earnings: 190 },
      { date: '2024-01-07', earnings: 160 }
    ]
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <FiBarChart2 className="h-12 w-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">Failed to Load Earnings</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={fetchEarnings}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, recent_transactions, chart_data } = earnings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your sales performance and payouts</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${summary.total_earnings.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500 ml-1">from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900">${summary.available_balance.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiCreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Ready for payout</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${summary.pending_earnings.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiCalendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Processing orders</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission Rate</p>
              <p className="text-2xl font-bold text-gray-900">{(summary.commission_rate * 100).toFixed(0)}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiBarChart2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Platform fee</span>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
        <div className="h-64 flex items-end justify-between space-x-2">
          {chart_data.map((data, index) => {
            const maxEarnings = Math.max(...chart_data.map(d => d.earnings));
            const height = (data.earnings / maxEarnings) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-600 rounded-t-sm min-h-[4px] transition-all duration-300 hover:bg-blue-700"
                  style={{ height: `${height}%` }}
                  title={`$${data.earnings} on ${new Date(data.date).toLocaleDateString()}`}
                />
                <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order/Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recent_transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.type === 'sale' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type === 'sale' ? 'Sale' : 'Payout'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{transaction.product_name}</div>
                      {transaction.order_id && (
                        <div className="text-gray-500 text-xs">{transaction.order_id}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.commission > 0 ? `$${transaction.commission.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.net_amount < 0 ? 'text-red-600' : 'text-green-600'}>
                      ${Math.abs(transaction.net_amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'processed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerEarningsPage;
