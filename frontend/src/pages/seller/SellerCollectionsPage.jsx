import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiTag,
  FiSearch,
  FiFilter,
} from 'react-icons/fi';
import { getSellerCollections, deleteCollection, updateCollection } from '../../services/sellerApi.js';
import Spinner from '../../components/common/Spinner.jsx';

const SellerCollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, collection: null });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await getSellerCollections();
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (collection) => {
    try {
      await updateCollection(collection.id, {
        is_active: !collection.is_active
      });
      // Update local state
      setCollections(collections.map(c => 
        c.id === collection.id 
          ? { ...c, is_active: !c.is_active }
          : c
      ));
    } catch (error) {
      console.error('Error updating collection status:', error);
    }
  };

  const handleDeleteCollection = async () => {
    if (!deleteModal.collection) return;

    try {
      await deleteCollection(deleteModal.collection.id);
      setCollections(collections.filter(c => c.id !== deleteModal.collection.id));
      setDeleteModal({ isOpen: false, collection: null });
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  // Filter collections based on search and status
  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && collection.is_active) ||
                         (filterStatus === 'inactive' && !collection.is_active);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Collections</h1>
          <p className="text-gray-600 mt-1">
            Manage your product collections and curated sets
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      {filteredCollections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <FiTag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {collections.length === 0 ? 'No collections yet' : 'No collections found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {collections.length === 0 
                ? 'Get started by creating your first collection.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {collections.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/seller/collections/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Create Collection
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <div key={collection.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Collection Image */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {collection.image_url ? (
                  <img
                    src={collection.image_url}
                    alt={collection.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                    <FiTag className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Collection Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {collection.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                    collection.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {collection.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {collection.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{collection.products?.length || 0} products</span>
                  <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/seller/collections/edit/${collection.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <FiEdit className="mr-1 h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleToggleStatus(collection)}
                      className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                        collection.is_active
                          ? 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {collection.is_active ? (
                        <>
                          <FiEyeOff className="mr-1 h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <FiEye className="mr-1 h-4 w-4" />
                          Show
                        </>
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, collection })}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <FiTrash2 className="mr-1 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Collection
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteModal.collection?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, collection: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCollection}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCollectionsPage;
