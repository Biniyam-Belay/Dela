import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/productApi';
import ProductCard from '../components/ui/ProductCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import ErrorMessage from '../components/common/ErrorMessage';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiStar } from "react-icons/fi";

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// --- Hero Section (Ultra Modern) ---
const HeroSection = () => (
  <section className="relative h-screen max-h-[1000px] flex items-center overflow-hidden bg-black">
    {/* Background with parallax effect would be ideal */}
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      <img
        src="/images/hero-3.jpg"
        alt="Luxury fashion collection"
        className="w-full h-full object-cover object-center"
        loading="eager"
      />
    </div>

    <div className="container mx-auto px-6 relative z-10">
      <div className="max-w-2xl">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 leading-tight">
          Redefine Your <span className="font-medium">Wardrobe</span>
        </h1>
        <p className="text-lg lg:text-xl text-neutral-300 mb-10 font-light">
          Curated essentials that elevate your everyday style.
        </p>
        <div className="flex gap-4">
          <Link
            to="/products"
            className="px-8 py-3 bg-white text-black font-medium hover:bg-neutral-100 transition-all duration-300 hover:scale-105"
          >
            Shop Now
          </Link>
          <Link
            to="/new-arrivals"
            className="px-8 py-3 border border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            New Arrivals
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// --- Trending Products Section ---
const TrendingProducts = ({ products, loading, error }) => {
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="text-3xl font-light text-neutral-800">Trending Now</h2>
          <p className="text-neutral-500 mt-2">This season's most loved pieces</p>
        </div>
        <Link to="/trending" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors">
          View all <FiArrowRight />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : products.length > 0
            ? products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            : <p className="col-span-full text-center text-neutral-500">No trending products available</p>}
      </div>
    </section>
  );
};

// --- New Arrivals Section ---
const NewArrivals = ({ products, loading, error }) => {
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <section className="bg-neutral-50 py-24">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl font-light text-neutral-800">New Arrivals</h2>
            <p className="text-neutral-500 mt-2">Fresh styles just for you</p>
          </div>
          <Link to="/new-arrivals" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors">
            View all <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : products.length > 0
              ? products.slice(4, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              : <p className="col-span-full text-center text-neutral-500">No new arrivals</p>}
        </div>
      </div>
    </section>
  );
};

// --- Brand Highlights ---
const BrandHighlights = () => (
  <section className="container mx-auto px-6 py-16">
    <h2 className="text-3xl font-light text-center text-neutral-800 mb-16">Our Promise</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-neutral-100 text-neutral-700">
            <FiStar size={24} />
          </div>
        </div>
        <h3 className="text-lg font-light text-neutral-800 mb-3">Premium Quality</h3>
        <p className="text-neutral-500">Only the finest materials and craftsmanship</p>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-neutral-100 text-neutral-700">
            <FiTruck size={24} />
          </div>
        </div>
        <h3 className="text-lg font-light text-neutral-800 mb-3">Fast Shipping</h3>
        <p className="text-neutral-500">Delivered to your door in 2-3 days</p>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-neutral-100 text-neutral-700">
            <FiRefreshCw size={24} />
          </div>
        </div>
        <h3 className="text-lg font-light text-neutral-800 mb-3">Easy Returns</h3>
        <p className="text-neutral-500">30-day hassle-free returns</p>
      </div>
    </div>
  </section>
);

// --- Main HomePage Component ---
const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts({ limit: 8, page: 1 });
        setProducts(response.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Could not load products");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="bg-white">
      <HeroSection />
      <TrendingProducts products={products} loading={loading} error={error} />
      <NewArrivals products={products} loading={loading} error={error} />
      <BrandHighlights />
    </div>
  );
};

export default HomePage;