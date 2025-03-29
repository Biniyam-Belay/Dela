import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminCategories, deleteAdminCategory } from '../../services/adminApi';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FiEdit2, FiTrash2, FiPlus, FiChevronLeft } from 'react-icons/fi';

const AdminCategoryListPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAdminCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError(err.error || err.message || 'Failed to load categories.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleDelete = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      try {
        setLoading(true);
        await deleteAdminCategory(categoryId);
        loadCategories();
      } catch (err) {
        setError(err.error || err.message || 'Failed to delete category.');
      }
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-1">Categories</h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
            <Link
              to="/admin/categories/new"
              className="flex items-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FiPlus size={18} />
              Add Category
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} className="mb-6" />}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Spinner />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500">
                {searchTerm ? 'No matching categories found' : 'No categories available'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-sm text-black hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500 md:hidden">
                          {category.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-4">
                          <Link
                            to={`/admin/categories/edit/${category.id}`}
                            className="text-gray-600 hover:text-black transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryListPage;