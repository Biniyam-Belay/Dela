import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiImage,
  FiSearch,
} from 'react-icons/fi';
import { 
  createCollection, 
  updateCollection, 
  getCollectionDetails,
  getSellerProducts,
  addProductToCollection,
  removeProductFromCollection
} from '../../services/sellerApi.js';
import Spinner from '../../components/common/Spinner.jsx';

const CollectionFormPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const isEditing = !!collectionId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    display_order: 0,
  });

  const [collectionProducts, setCollectionProducts] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAvailableProducts();
    if (isEditing) {
      fetchCollectionDetails();
    }
  }, [collectionId]);

  const fetchAvailableProducts = async () => {
    try {
      const products = await getSellerProducts();
      setAvailableProducts(products || []);
    } catch (error) {
      console.error('Error fetching available products:', error);
    }
  };

  const fetchCollectionDetails = async () => {
    try {
      setLoading(true);
      const collection = await getCollectionDetails(collectionId);
      
      setFormData({
        name: collection.name || '',
        description: collection.description || '',
        image_url: collection.image_url || '',
        is_active: collection.is_active !== false,
        display_order: collection.display_order || 0,
      });

      setCollectionProducts(collection.products || []);
    } catch (error) {
      console.error('Error fetching collection details:', error);
      navigate('/seller/collections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Collection name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await updateCollection(collectionId, formData);
      } else {
        await createCollection(formData);
      }
      navigate('/seller/collections');
    } catch (error) {
      console.error('Error saving collection:', error);
      setErrors({ submit: error.message || 'Failed to save collection' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async (product) => {
    if (!isEditing) {
      // For new collections, just add to local state
      if (!collectionProducts.find(p => p.id === product.id)) {
        setCollectionProducts(prev => [...prev, product]);
      }
      return;
    }

    try {
      await addProductToCollection(collectionId, product.id);
      setCollectionProducts(prev => [...prev, product]);
    } catch (error) {
      console.error('Error adding product to collection:', error);
    }
  };

  const handleRemoveProduct = async (product) => {
    if (!isEditing) {
      // For new collections, just remove from local state
      setCollectionProducts(prev => prev.filter(p => p.id !== product.id));
      return;
    }

    try {
      await removeProductFromCollection(collectionId, product.id);
      setCollectionProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (error) {
      console.error('Error removing product from collection:', error);
    }
  };

  // Filter available products that aren't already in the collection
  const filteredAvailableProducts = availableProducts.filter(product => {
    const isInCollection = collectionProducts.some(cp => cp.id === product.id);
    const matchesSearch = product.name.toLowerCase().includes(productSearchTerm.toLowerCase());
    return !isInCollection && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Collection' : 'Create New Collection'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update your collection details and products' : 'Create a curated collection of your products'}
          </p>
        </div>
        <button
          onClick={() => navigate('/seller/collections')}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <FiX className="mr-2 h-4 w-4" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Collection Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Details</h2>
          
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Collection Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter collection name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe your collection..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                Collection Image URL
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">
                Display Order
              </label>
              <input
                type="number"
                id="display_order"
                name="display_order"
                min="0"
                value={formData.display_order}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Make collection active and visible to customers
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Collection Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Products</h2>
          
          {/* Current Products */}
          {collectionProducts.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Products ({collectionProducts.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collectionProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiImage className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500">${product.price}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No products selected for this collection yet.</p>
            </div>
          )}

          {/* Add Products */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add Products</h3>
            
            {/* Product Search */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your products..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Available Products */}
            {filteredAvailableProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredAvailableProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg mr-3 flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiImage className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-500">${product.price}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <FiPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {availableProducts.length === 0 
                  ? 'No products available. Create some products first.'
                  : 'No available products match your search.'
                }
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/seller/collections')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <Spinner size="small" />
            ) : (
              <FiSave className="mr-2 h-4 w-4" />
            )}
            {saving ? 'Saving...' : (isEditing ? 'Update Collection' : 'Create Collection')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CollectionFormPage;
