import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/productApi';
import ProductCard from '../components/ui/ProductCard';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: searchParams.get('page') || 1,
          limit: searchParams.get('limit') || 12,
          category: searchParams.get('category') || undefined,
          search: searchParams.get('search') || undefined,
        };

        const productData = await fetchProducts(params);
        const categoryData = await fetchCategories();

        setProducts(productData.data);
        setCategories(categoryData.data);
        setTotalPages(productData.totalPages);
        setCurrentPage(productData.currentPage);
      } catch (err) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const handleCategoryFilter = (categorySlug) => {
    setSearchParams({ category: categorySlug, page: 1 });
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const searchTerm = event.target.elements.search.value;
    setSearchParams({ search: searchTerm, page: 1 });
  };

  const handlePageChange = (newPage) => {
    searchParams.set('page', newPage);
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-light text-gray-900">Our Collection</h1>
          <Link 
            to="/" 
            className="flex items-center text-gray-600 hover:text-black transition-colors"
          >
            <FiChevronLeft className="mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Filter/Search Bar */}
        <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Filter */}
          <select
            onChange={(e) => handleCategoryFilter(e.target.value)}
            value={searchParams.get('category') || ''}
            className="p-3 border border-gray-200 rounded-lg shadow-sm w-full md:w-64 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="search"
                name="search"
                placeholder="Search products..."
                defaultValue={searchParams.get('search') || ''}
                className="pl-10 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm w-full focus:outline-none focus:ring-1 focus:ring-gray-300"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              type="submit"
              className="px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading/Error State */}
        {loading && <div className="flex justify-center py-20"><Spinner /></div>}
        {error && <ErrorMessage message={error} />}

        {/* No Products Found */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-lg text-gray-600 mb-6">No products found matching your criteria.</p>
            <button
              onClick={() => setSearchParams({})}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`p-2 rounded-full ${currentPage <= 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FiChevronLeft size={20} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    page === currentPage
                      ? 'bg-black text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`p-2 rounded-full ${currentPage >= totalPages ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;