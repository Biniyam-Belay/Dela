import React, { useState, useMemo, useEffect } from "react"; // Removed useQueryBase
import { Link } from "react-router-dom";
import { ShoppingBag, RefreshCw, Clock } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/productApi';
import ProductCard from '../components/ui/ProductCard';
import PriceHighlightProductCard from '../components/ui/PriceHighlightProductCard';
// Removed useQueryBase import as it's no longer needed

const collections = [
  {
    id: "signature",
    name: "Signature Collection",
    description: "Handcrafted luxury essentials. Timeless pieces for the modern wardrobe.",
    image: "/images/hero-2.jpg",
    highlight: "New Season",
    cta: "Explore Collection",
    url: "/collections/signature",
    badge: "Up to 30% Off"
  },
  {
    id: "minimalist",
    name: "Minimalist Edit",
    description: "Sleek, versatile, and designed for everyday elegance.",
    image: "/images/tshirt-blue.jpg",
    highlight: "Minimalist",
    cta: "Shop Minimalist",
    url: "/collections/minimalist",
    badge: "Best Seller"
  },
  {
    id: "tech",
    name: "Tech Essentials",
    description: "Smart accessories for a connected lifestyle.",
    image: "/images/smartwatch.jpg",
    highlight: "Tech",
    cta: "Shop Tech",
    url: "/collections/tech",
    badge: "Just Arrived"
  }
];

const featureIcons = [
  {
    icon: <ShoppingBag className="h-6 w-6" />, label: "Free Shipping", desc: "On orders over $150"
  },
  {
    icon: <RefreshCw className="h-6 w-6" />, label: "Easy Returns", desc: "30-day hassle-free returns"
  },
  {
    icon: <Clock className="h-6 w-6" />, label: "Limited Time", desc: "While supplies last"
  }
];

const priceRanges = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200+", min: 200, max: null },
];

const CollectionsPage = () => {
  // Fetch flash deals (products with flash_deal=true and not expired)
  const { data, isLoading, error } = useQuery({
    queryKey: ['flash-deals'],
    queryFn: () => fetchProducts({ flash_deal: true, limit: 8 }),
    select: (res) => res?.data?.filter(
      p => p.flash_deal && (!p.flash_deal_end || new Date(p.flash_deal_end) > new Date())
    ) || [],
    staleTime: 1000 * 60 * 5,
  });

  // Find soonest-ending deal for countdown
  const soonestEnd = useMemo(() => {
    if (!data?.length) return null;
    return data.reduce((min, p) => {
      if (!p.flash_deal_end) return min;
      const end = new Date(p.flash_deal_end);
      return (!min || end < min) ? end : min;
    }, null);
  }, [data]);

  // Countdown timer state
  const [timer, setTimer] = useState('');
  useEffect(() => {
    if (!soonestEnd) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = soonestEnd - now;
      if (diff <= 0) {
        setTimer('00:00:00');
        clearInterval(interval);
        return;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [soonestEnd]);

  const [selectedPrice, setSelectedPrice] = useState(null);

  const {
    data: filteredProducts,
    isLoading: filteredLoading,
    error: filteredError,
  } = useQuery({
    queryKey: [
      'shop-by-price',
      selectedPrice?.min,
      selectedPrice?.max,
    ],
    queryFn: () => fetchProducts({
      ...(selectedPrice ? {
        ...(selectedPrice.min !== null ? { price_gte: selectedPrice.min } : {}),
        ...(selectedPrice.max !== null ? { price_lte: selectedPrice.max } : {}),
      } : {}),
      limit: 8,
    }),
    enabled: !!selectedPrice,
    select: (res) => res?.data || [],
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="bg-white min-h-screen text-neutral-900">
      <section className="container mx-auto px-4 sm:px-6 pt-32 pb-16">
        <div className="max-w-2xl mb-12">
          <div className="inline-block px-3 py-1 mb-6 border border-neutral-200 text-xs uppercase tracking-widest text-neutral-500 bg-white">
            Curated Collections
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight mb-6 leading-tight tracking-tight">
            Discover <span className="font-medium">Artisan</span> Style
          </h1>
          <p className="text-lg text-neutral-600 mb-10 font-light max-w-lg">
            Explore our signature collections, crafted for those who value timeless design and modern luxury.
          </p>
          <div className="flex flex-wrap gap-6 mb-10">
            {featureIcons.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full border border-neutral-200 flex items-center justify-center bg-white">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{f.label}</p>
                  <p className="text-xs text-neutral-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((col) => (
            <div key={col.id} className="relative group rounded-2xl overflow-hidden shadow-lg border border-neutral-100 bg-white">
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={col.image}
                  alt={col.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                  onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-end p-6">
                  <div>
                    <span className="inline-block mb-2 px-3 py-1 bg-neutral-100 text-xs uppercase tracking-widest rounded-full text-neutral-500">
                      {col.highlight}
                    </span>
                    <h2 className="text-2xl font-semibold mb-2 drop-shadow text-white">{col.name}</h2>
                    <p className="text-sm text-neutral-200 mb-4 max-w-xs drop-shadow">{col.description}</p>
                    <Link
                      to={col.url}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-medium shadow hover:bg-neutral-100 transition-all text-base"
                    >
                      {col.cta}
                    </Link>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 text-black text-xs font-semibold px-4 py-1 rounded-full shadow border border-neutral-200">
                  {col.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ad Banner */}
      <section className="container mx-auto px-4 sm:px-6 mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-neutral-900 shadow-lg flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-6">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-2">Spring Sale: Up to 50% Off</h2>
            <p className="text-white/80 mb-4 max-w-md">Refresh your style with exclusive deals on our best-selling collections. Limited time only!</p>
            <Link to="/products" className="inline-block px-6 py-3 bg-white text-black font-medium rounded-full shadow hover:bg-neutral-100 transition-all">Shop Now</Link>
          </div>
          <img src="/images/hero-3.jpg" alt="Ad Banner" className="w-40 h-40 object-cover rounded-xl shadow-lg hidden md:block" />
        </div>
      </section>

      {/* Promo Grid */}
      <section className="container mx-auto px-4 sm:px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-100 rounded-xl p-6 flex flex-col items-center text-center shadow">
            <img src="/images/Headphones.jpg" alt="Headphones" className="w-20 h-20 object-cover mb-4 rounded-full" />
            <h3 className="text-lg font-semibold mb-2">Audio Deals</h3>
            <p className="text-neutral-500 mb-3">Top headphones and speakers for every music lover.</p>
            <Link to="/products?category=audio" className="text-indigo-600 font-medium hover:underline">Shop Audio</Link>
          </div>
          <div className="bg-neutral-100 rounded-xl p-6 flex flex-col items-center text-center shadow">
            <img src="/images/smartwatch.jpg" alt="Smartwatch" className="w-20 h-20 object-cover mb-4 rounded-full" />
            <h3 className="text-lg font-semibold mb-2">Wearable Tech</h3>
            <p className="text-neutral-500 mb-3">Smartwatches and fitness bands for a connected lifestyle.</p>
            <Link to="/products?category=wearables" className="text-indigo-600 font-medium hover:underline">Shop Wearables</Link>
          </div>
          <div className="bg-neutral-100 rounded-xl p-6 flex flex-col items-center text-center shadow">
            <img src="/images/tshirt-blue.jpg" alt="T-shirt" className="w-20 h-20 object-cover mb-4 rounded-full" />
            <h3 className="text-lg font-semibold mb-2">Fashion Picks</h3>
            <p className="text-neutral-500 mb-3">Minimalist and signature apparel for every season.</p>
            <Link to="/products?category=fashion" className="text-indigo-600 font-medium hover:underline">Shop Fashion</Link>
          </div>
        </div>
      </section>

      {/* Flash Deals / Limited Time Offers */}
      {!isLoading && data && data.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-light mb-2">Flash Deals</h2>
              <p className="text-neutral-500 text-sm">Limited time offers on top picks. Grab them before they're gone!</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full shadow">
              <span>Ends in</span>
              <span id="flash-deal-timer" className="font-mono">{timer || '--:--:--'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.map(product => (
              <ProductCard key={product.id} product={product} featured />
            ))}
          </div>
        </section>
      )}

      {/* Shop by Price / Filter Bar */}
      <section className="container mx-auto px-4 sm:px-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl font-light">Shop by Price</h2>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-full text-sm border transition ${selectedPrice === range ? 'bg-black text-white font-medium' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-200'}`}
                onClick={() => setSelectedPrice(range)}
              >
                {range.label}
              </button>
            ))}
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedPrice ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'}`}
              onClick={() => setSelectedPrice(null)}
            >
              All
            </button>
          </div>
        </div>
        {/* Dynamic Product Grid for Shop by Price - Using the new card */}
        {selectedPrice && (
          <div className="mt-8"> {/* Added margin top */}
            {filteredLoading ? (
              // Use a slightly different pulse animation matching the new card's structure
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-neutral-100 border border-neutral-200 rounded-lg shadow p-4 animate-pulse h-80"> {/* Adjusted height */}
                    <div className="aspect-[4/3] bg-neutral-200 rounded mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between items-end">
                      <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
                      <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredError ? (
              <div className="text-center text-red-500 py-10">Could not load products for this price range.</div>
            ) : filteredProducts.length > 0 ? (
              // Use a grid layout for the new cards
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <PriceHighlightProductCard key={product.id} product={product} /> // Use the new component
                ))}
              </div>
            ) : (
              <div className="text-center text-neutral-500 py-10">No products found for selected price range.</div>
            )}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-light mb-4 tracking-tight">Join Our Community</h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto text-sm sm:text-base">
            Subscribe for exclusive updates, early access to new collections, and personalized recommendations.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Your email address" className="h-12 border border-neutral-300 bg-white rounded px-4 flex-1" required />
            <button type="submit" className="h-12 px-6 bg-black text-white rounded font-light hover:bg-neutral-900 transition">Subscribe</button>
          </form>
          <p className="text-xs text-neutral-500 mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CollectionsPage;
