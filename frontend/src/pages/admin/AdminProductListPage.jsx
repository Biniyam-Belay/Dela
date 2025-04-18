import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAdminProducts, deleteAdminProduct } from '../../services/adminApi';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiAlertCircle } from 'react-icons/fi';
import Pagination from '../../components/common/Pagination';

const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(numericAmount) 
    ? 'N/A' 
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericAmount);
};

const AdminProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Debounce search input
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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: currentSearch || undefined,
      };
      const response = await fetchAdminProducts(params);
      setProducts(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.totalProducts || 0);
    } catch (err) {
      setError(err.error || err.message || 'Failed to load products.');
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Delete "${productName}"? This cannot be undone.`)) {
      try {
        setLoading(true);
        await deleteAdminProduct(productId);
        if (products.length === 1 && currentPage > 1) {
          handlePageChange(currentPage - 1);
        } else {
          loadProducts();
        }
      } catch (err) {
        setError(err.error || err.message || 'Failed to delete product.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', newPage.toString());
        return newParams;
      }, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">
            {loading ? 'Loading...' : `${totalProducts} products found`}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm whitespace-nowrap"
        >
          <FiPlus size={16} />
          Add Product
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        <input
          type="search"
          placeholder="Search products..."
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
        ) : products.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            <FiAlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-4" />
            <p className="font-medium">No products found</p>
            {currentSearch && <p className="text-sm mt-1">Try adjusting your search.</p>}
            {!currentSearch && (
              <Link
                to="/admin/products/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm"
              >
                <FiPlus size={16} />
                Add First Product
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-md overflow-hidden">
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL || ''}${product.images?.[0] || '/placeholder-image.jpg'}`}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-500 lg:hidden mt-1">
                              {product.category?.name || <span className="italic">No category</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">
                        {product.category?.name || <span className="italic text-slate-400">No category</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">
                        {product.stock_quantity ?? product.stockQuantity ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <div className="flex items-center justify-end gap-4">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="text-slate-600 hover:text-slate-900 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
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

            {/* Pagination */}
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

export default AdminProductListPage;