import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // To read query params like ?category=...
import { fetchProducts, fetchCategories } from '../services/productApi';
import ProductCard from '../components/ui/ProductCard';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
// Import pagination component later if needed

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams(); // Get query params

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get params from URL for API call
        const params = {
          page: searchParams.get('page') || 1,
          limit: searchParams.get('limit') || 12, // Example: 12 products per page
          category: searchParams.get('category') || undefined,
          search: searchParams.get('search') || undefined,
        };

        const productData = await fetchProducts(params);
        const categoryData = await fetchCategories(); // Fetch categories for filtering options

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
  }, [searchParams]); // Re-fetch when searchParams change (e.g., page, category filter)

  // --- Handlers for filtering/pagination (basic examples) ---
  const handleCategoryFilter = (categorySlug) => {
    setSearchParams({ category: categorySlug, page: 1 }); // Reset to page 1 on filter change
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Our Products</h1>

      {/* Basic Filter/Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
         {/* Category Filter Dropdown */}
         <select
            onChange={(e) => handleCategoryFilter(e.target.value)}
            value={searchParams.get('category') || ''}
            className="p-2 border rounded"
         >
            <option value="">All Categories</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
         </select>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
              <input
                  type="search"
                  name="search"
                  placeholder="Search products..."
                  defaultValue={searchParams.get('search') || ''}
                  className="p-2 border rounded w-full md:w-auto"
              />
              <button type="submit" className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Search
              </button>
          </form>
      </div>


      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && products.length === 0 && (
        <p className="text-center text-gray-500">No products found.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Simple Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={page === currentPage}
                className={`px-4 py-2 border rounded ${
                  page === currentPage
                    ? 'bg-blue-600 text-white cursor-default'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductListPage;