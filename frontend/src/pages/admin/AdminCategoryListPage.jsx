import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories, deleteCategory } from '../../store/categorySlice';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { Helmet } from 'react-helmet';
import Pagination from '../../components/common/Pagination'; // Assuming you have a Pagination component
import toast from 'react-hot-toast'; // For delete success/error messages

const AdminCategoryListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const dispatch = useDispatch();
  const categoriesSlice = useSelector((state) => state.categories);

  const {
    items: categories = [],
    loading = false, 
    error = null,    
    totalPages = 1,
    totalCategories = 0,
  } = categoriesSlice || { 
    items: [], 
    loading: false, 
    error: null, 
    totalPages: 1, 
    totalCategories: 0 
  };

  const [deleteError, setDeleteError] = useState(null); 
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (searchTerm) {
          newParams.set('search', searchTerm);
        } else {
          newParams.delete('search');
        }
        newParams.set('page', '1');
        return newParams;
      }, { replace: true });
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  useEffect(() => {
    const fetchParams = {
      page: currentPage,
      limit: 10, 
      search: currentSearch || undefined,
    };
    dispatch(fetchCategories(fetchParams));
  }, [dispatch, currentPage, currentSearch]);

  const handleDelete = async (categoryId, categoryName) => {
    if (window.confirm(`Are you sure you want to delete "${categoryName}"? This cannot be undone.`)) {
      setDeletingId(categoryId);
      setDeleteError(null);
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        toast.success(`Category "${categoryName}" deleted successfully!`);
      } catch (err) {
        const errorMessage = err?.message || err || 'Failed to delete category.';
        setDeleteError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', newPage.toString());
        return newParams;
      }, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Admin Categories | SuriAddis</title>
        <meta name="description" content="Admin: View and manage product categories in the SuriAddis store." />
      </Helmet>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Loading categories...' : `${totalCategories} categor${totalCategories !== 1 ? 'ies' : 'y'} found`}
          </p>
        </div>
        <Link
          to="/admin/categories/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm whitespace-nowrap"
        >
          <FiPlus size={16} />
          Add Category
        </Link>
      </div>

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
      {error && <ErrorMessage message={error.message || error} />} {/* Use the error from Redux state */}
      {deleteError && <ErrorMessage message={deleteError} />} {/* Keep local deleteError for specific feedback */}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading && categories.length === 0 ? (
          <div className="flex justify-center items-center p-12 min-h-[200px]">
            <Spinner />
          </div>
        ) : !loading && categories.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            <FiAlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-4" />
            <p className="font-medium">No categories found</p>
            {currentSearch && <p className="text-sm mt-1">Try adjusting your search.</p>}
            {!currentSearch && (
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
          <>
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
                  {categories.map((category) => (
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
                            disabled={deletingId === category.id || loading}
                            className={`text-slate-600 hover:text-red-600 transition-colors ${
                              deletingId === category.id || loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Delete"
                          >
                            {deletingId === category.id ? <Spinner size="xs" /> : <FiTrash2 size={16} />}
                          </button>
                        </div>
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

export default AdminCategoryListPage;