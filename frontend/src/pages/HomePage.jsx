// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/productApi';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard'; // Import Product Skeleton
import CategorySkeletonCard from '../components/ui/CategorySkeletonCard'; // Import Category Skeleton
import ErrorMessage from '../components/common/ErrorMessage';
import { FaCheckCircle, FaShippingFast, FaHeadset } from 'react-icons/fa'; // Import Icons

// --- Stylish Hero Section ---
const HeroSection = () => (
  <div className="relative bg-gradient-to-r from-gray-700 via-gray-900 to-black text-white pt-32 pb-24 md:pt-48 md:pb-40 px-4 text-center rounded-b-lg shadow-2xl overflow-hidden mb-16 md:mb-24">
     {/* Optional: Subtle Background Image */}
     {/* <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url(/path/to/your/hero-pattern.png)' }}></div> */}

     {/* Content */}
    <div className="relative z-10">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse-slow"> {/* Animated Gradient Text */}
        Welcome to SuriAddis
      </h1>
      <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
        Explore curated collections and discover products you'll love. High quality, delivered fast.
      </p>
      <Link
        to="/products"
        className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg py-3 px-10 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        Start Shopping
      </Link>
    </div>
  </div>
);

// --- Visual Category Card ---
const CategoryCard = ({ category }) => (
    <Link
        to={`/products?category=${category.slug}`}
        className="group relative block border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-40 md:h-48" // Fixed height
    >
        {/* Background Image (Replace with actual category images) */}
        <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundImage: `url(/placeholder-category-${category.id % 3 + 1}.jpg)` }} // Placeholder image logic
        ></div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-opacity duration-300"></div>
        {/* Category Name */}
        <div className="relative z-10 flex items-center justify-center h-full">
            <h3 className="text-xl md:text-2xl font-semibold text-white text-center p-2">{category.name}</h3>
        </div>
    </Link>
);


// --- Value Proposition Card ---
const ValuePropCard = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform duration-300 hover:-translate-y-2">
        <div className="text-4xl text-blue-600 mb-4 inline-block">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

// --- Main HomePage Component ---
const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHomePageData = async () => {
      // Reset states on new load attempt
      setLoadingProducts(true);
      setLoadingCategories(true);
      setError(null);

      try {
        // Fetch in parallel for speed
        const [productResponse, categoryResponse] = await Promise.allSettled([
          fetchProducts({ limit: 4, page: 1 }), // Fetch 4 featured products
          fetchCategories()                     // Fetch all categories
        ]);

        if (productResponse.status === 'fulfilled') {
          setFeaturedProducts(productResponse.value.data);
        } else {
          console.error("Error fetching products:", productResponse.reason);
          // Set partial error or handle as needed
          setError(prev => prev ? `${prev} Failed to load products.` : 'Failed to load products.');
        }

        if (categoryResponse.status === 'fulfilled') {
          setCategories(categoryResponse.value.data);
        } else {
          console.error("Error fetching categories:", categoryResponse.reason);
           setError(prev => prev ? `${prev} Failed to load categories.` : 'Failed to load categories.');
        }

      } catch (err) { // Catch unexpected errors during Promise.allSettled or setup
        console.error("Homepage fetch error:", err);
        setError('An unexpected error occurred while loading data.');
      } finally {
        // Ensure loading state is always turned off
        setLoadingProducts(false);
        setLoadingCategories(false);
      }
    };

    loadHomePageData();
  }, []); // Runs once on component mount

  return (
    <div className="space-y-16 md:space-y-24 mb-16 md:mb-24"> {/* Increased spacing */}
      {/* 1. Hero Section */}
      <HeroSection />

      {/* Container for main content */}
      <div className="container mx-auto px-4 space-y-16 md:space-y-24">

        {/* 2. Featured Products Section */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-gray-800 tracking-tight">
            Featured Products
          </h2>
           {error && <ErrorMessage message={error.includes('products') || error.includes('unexpected') ? 'Could not load featured products.' : null} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loadingProducts
              ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />) // Show 4 skeletons while loading
              : featuredProducts.length > 0
                ? featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
                : !error && <p className="col-span-full text-center text-gray-500">No featured products available right now.</p> // Show message only if no error occurred related to products
             }
          </div>
           {!loadingProducts && featuredProducts.length > 0 && (
             <div className="text-center mt-10 md:mt-12">
                 <Link
                     to="/products"
                     className="text-blue-600 hover:text-blue-800 font-semibold transition duration-300 inline-flex items-center group"
                 >
                     View All Products
                     <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                 </Link>
             </div>
           )}
        </section>

        {/* 3. Categories Section */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-gray-800 tracking-tight">
            Shop by Category
          </h2>
           {error && <ErrorMessage message={error.includes('categories') || error.includes('unexpected') ? 'Could not load categories.' : null} />}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {loadingCategories
                 ? Array.from({ length: categories.length > 0 ? categories.length : 4 }).map((_, index) => <CategorySkeletonCard key={index} />) // Use fetched category count if available for skeleton count, else default
                 : categories.length > 0
                    ? categories.map((category) => <CategoryCard key={category.id} category={category} />)
                    : !error && <p className="col-span-full text-center text-gray-500">No categories found.</p> // Show message only if no error related to categories occurred
              }
          </div>
        </section>

        {/* 4. Value Propositions Section */}
        <section className="bg-gradient-to-r from-gray-50 to-blue-50 py-16 md:py-20 rounded-lg shadow-inner">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-12 text-gray-800 tracking-tight">Why Choose Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    <ValuePropCard
                        icon={<FaCheckCircle />}
                        title="Quality Assured"
                        description="We source and verify the best products, ensuring top quality."
                    />
                    <ValuePropCard
                        icon={<FaShippingFast />}
                        title="Fast & Reliable Shipping"
                        description="Get your orders delivered quickly to your doorstep."
                    />
                    <ValuePropCard
                        icon={<FaHeadset />}
                        title="Exceptional Support"
                        description="Our dedicated team is here to help you every step of the way."
                    />
                </div>
            </div>
        </section>

      </div> {/* End main content container */}
    </div> // End overall page wrapper
  );
};

export default HomePage;