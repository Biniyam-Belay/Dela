import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminCategories, deleteAdminCategory } from '../../services/adminApi';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiAlertCircle } from 'react-icons/fi';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">Manage your product categories</p>
        </div>
        <Link
          to="/admin/categories/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm whitespace-nowrap"
        >
          <FiPlus size={16} />
          Add Category
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        <input
          type="search"
          placeholder="Search categories..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spinner />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            <FiAlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-4" />
            <p className="font-medium">No categories found</p>
            {searchTerm && <p className="text-sm mt-1">Try adjusting your search.</p>}
            {!searchTerm && (
              <Link
                to="/admin/categories/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm"
              >
                <FiPlus size={16} />
                Add First Category
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{category.name}</div>
                      <div className="text-sm text-slate-500 md:hidden mt-1">
                        {category.description || <span className="italic">No description</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                      {category.description ? (
                        <span className="line-clamp-2">{category.description}</span>
                      ) : (
                        <span className="italic text-slate-400">No description</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          to={`/admin/categories/edit/${category.id}`}
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="text-slate-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
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
  );
};

export default AdminCategoryListPage;