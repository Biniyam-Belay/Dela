import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiShoppingBag,
  FiTag,
  FiTrendingUp,
  FiEye,
  FiPlus,
  FiBox,
} from 'react-icons/fi';
import { getSellerProfile, getSellerCollections, getSellerEarnings, getSellerOrders } from '../../services/sellerApi.js';
import Spinner from '../../components/common/Spinner.jsx';

const SellerDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellerProfile, setSellerProfile] = useState(null);
  const [collections, setCollections] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // For now, use mock data since the backend APIs might not be fully ready
        // Later we can uncomment the real API calls
        
        // Mock data
        const mockProfile = { business_name: 'Your Store', status: 'approved' };
        const mockCollections = [
          {
            id: '1',
            name: 'Summer Collection',
            description: 'Hot summer items',
            is_active: true,
            products: [{ id: 1 }, { id: 2 }, { id: 3 }],
            created_at: new Date().toISOString(),
            image_url: null
          },
          {
            id: '2',
            name: 'Winter Collection',
            description: 'Cozy winter items',
            is_active: false,
            products: [{ id: 4 }, { id: 5 }],
            created_at: new Date().toISOString(),
            image_url: null
          }
        ];
        const mockEarnings = { total_earnings: 1250.50 };
        const mockOrders = [
          {
            id: '1',
            order_number: 'ORD-001',
            total_amount: 89.99,
            status: 'completed',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            order_number: 'ORD-002',
            total_amount: 156.50,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ];

        setSellerProfile(mockProfile);
        setCollections(mockCollections);
        setEarnings(mockEarnings);
        setRecentOrders(mockOrders.slice(0, 5));

        // Calculate stats
        const totalProducts = mockCollections.reduce((total, collection) => {
          return total + (collection.products?.length || 0);
        }, 0);

        setStats({
          totalCollections: mockCollections.length,
          totalProducts,
          totalOrders: mockOrders.length,
          totalEarnings: mockEarnings.total_earnings,
        });

        /* Real API calls - uncomment when backend is ready
        const [profileData, collectionsData, earningsData, ordersData] = await Promise.all([
          getSellerProfile(),
          getSellerCollections(),
          getSellerEarnings(),
          getSellerOrders(),
        ]);

        setSellerProfile(profileData);
        setCollections(collectionsData || []);
        setEarnings(earningsData);
        setRecentOrders((ordersData || []).slice(0, 5));

        const totalProducts = (collectionsData || []).reduce((total, collection) => {
          return total + (collection.products?.length || 0);
        }, 0);

        setStats({
          totalCollections: collectionsData?.length || 0,
          totalProducts,
          totalOrders: ordersData?.length || 0,
          totalEarnings: earningsData?.total_earnings || 0,
        });
        */

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={() => {
            setError('');
            setLoading(true);
            fetchDashboardData();
          }} 
          className="mt-2 text-red-600 hover:text-red-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {sellerProfile?.business_name || 'Seller'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your store today.
            </p>
          </div>
          <Link
            to="/seller/collections/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Create Collection
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        {/* Collections */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiTag className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Collections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCollections}</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiBox className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Collections */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Collections</h2>
              <Link
                to="/seller/collections"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {collections.length === 0 ? (
              <div className="text-center py-8">
                <FiTag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No collections yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first collection.
                </p>
                <div className="mt-6">
                  <Link
                    to="/seller/collections/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiPlus className="mr-2 h-4 w-4" />
                    Create Collection
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {collections.slice(0, 3).map((collection) => (
                  <div key={collection.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                        {collection.image_url ? (
                          <img
                            src={collection.image_url}
                            alt={collection.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <FiTag className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{collection.name}</h3>
                        <p className="text-sm text-gray-500">
                          {collection.products?.length || 0} products
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        collection.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {collection.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Link
                        to={`/seller/collections/edit/${collection.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link
                to="/seller/orders"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Orders will appear here once customers start purchasing from your collections.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Order #{order.order_number}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${order.total_amount}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/seller/collections/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <FiPlus className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Create Collection</h3>
              <p className="text-sm text-gray-500">Add a new product collection</p>
            </div>
          </Link>
          <Link
            to="/seller/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <FiEye className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">View Profile</h3>
              <p className="text-sm text-gray-500">Manage your seller profile</p>
            </div>
          </Link>
          <Link
            to="/seller/earnings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <FiTrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-500">Check your earnings and stats</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
