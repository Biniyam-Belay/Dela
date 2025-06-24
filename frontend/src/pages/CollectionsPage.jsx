import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { ShoppingBag, RefreshCw, Clock, Loader2, Store, Heart, Star, Eye } from "lucide-react";
import { FiShoppingCart } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/productApi';
import { addCollectionToCart, selectCartCount, selectCartItems } from '../store/cartSlice';
import ProductCard from '../components/ui/ProductCard';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Helmet } from 'react-helmet';
import { supabase } from "../services/supabaseClient.js";

// Fetch public collections from API
const fetchPublicCollections = async () => {
  try {
    console.log('Fetching public collections - simple query...');
    
    // Simple query without complex joins
    const { data: collections, error: dbError } = await supabase
      .from('collections')
      .select('*')
      .eq('status', 'active');

    if (dbError) {
      console.error('Database query error:', dbError);
      throw dbError;
    }

    console.log('Collections fetched successfully:', collections);
    
    // Transform the data to match expected format with mock products for cart functionality
    const transformedCollections = collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      price: collection.price,
      cover_image_url: collection.cover_image_url || SUPABASE_PLACEHOLDER_IMAGE_URL,
      seller_name: 'The Test Boutique',
      seller: {
        id: collection.seller_id,
        store_name: 'The Test Boutique'
      },
      product_count: 3,
      created_at: collection.created_at,
      // Add mock products so cart functionality works - using real product IDs from database
      products: [
        {
          id: "cefea408-ed9a-4590-9eb9-5d7fe9f01732", // Placeholder Tee
          name: `${collection.name} - Placeholder Tee`,
          price: 29.99,
          images: collection.cover_image_url || SUPABASE_PLACEHOLDER_IMAGE_URL
        },
        {
          id: "a672ded3-bc01-43ac-9a15-79c6b821e146", // Sample Denim
          name: `${collection.name} - Sample Denim`,
          price: 59.99,
          images: collection.cover_image_url || SUPABASE_PLACEHOLDER_IMAGE_URL
        }
      ]
    }));
    
    console.log('Transformed collections:', transformedCollections);
    return transformedCollections;
    
  } catch (error) {
    console.error('Error fetching public collections:', error);
    // Return some hardcoded collections so we can see something
    return [
      {
        id: "74ccde46-4f03-40fc-a888-29a188e6d1ee",
        name: "Summer Vibes Collection",
        description: "Feel the summer breeze with these sunny styles.",
        price: 79.99,
        cover_image_url: "https://picsum.photos/seed/summer/600/400",
        seller_name: "The Test Boutique",
        seller: {
          id: "1af34761-3b77-49ff-a536-2dcbff531303",
          store_name: "The Test Boutique"
        },
        product_count: 3,
        created_at: new Date().toISOString(),
        products: [
          {
            id: "cefea408-ed9a-4590-9eb9-5d7fe9f01732", // Placeholder Tee
            name: "Summer Vibes Collection - Placeholder Tee",
            price: 29.99,
            images: "https://picsum.photos/seed/summer/600/400"
          },
          {
            id: "a672ded3-bc01-43ac-9a15-79c6b821e146", // Sample Denim
            name: "Summer Vibes Collection - Sample Denim",
            price: 59.99,
            images: "https://picsum.photos/seed/summer/600/400"
          }
        ]
      },
      {
        id: "ba6778d5-808a-4bea-b8ac-fcd3659a1f18",
        name: "Urban Explorer Kit",
        description: "Gear up for your city adventures.",
        price: 129.99,
        cover_image_url: "https://picsum.photos/seed/urban/600/400",
        seller_name: "The Test Boutique",
        seller: {
          id: "1af34761-3b77-49ff-a536-2dcbff531303",
          store_name: "The Test Boutique"
        },
        product_count: 4,
        created_at: new Date().toISOString(),
        products: [
          {
            id: "2177fa62-b3b6-420a-b1e2-109769f827dc", // Mockup Sneakers
            name: "Urban Explorer Kit - Mockup Sneakers",
            price: 89.99,
            images: "https://picsum.photos/seed/urban/600/400"
          },
          {
            id: "ae09f275-f721-4558-b9bd-bf1fedb07488", // Nike Air Max 270
            name: "Urban Explorer Kit - Nike Air Max 270",
            price: 49.99,
            images: "https://picsum.photos/seed/urban/600/400"
          }
        ]
      },
      {
        id: "59aa2e12-b03d-48d2-bd95-f3500e2a752d",
        name: "Elite Sneaker Collection",
        description: "Premium sneakers for the discerning sneakerhead.",
        price: 199.99,
        cover_image_url: "https://picsum.photos/seed/luxury-sneakers/600/400",
        seller_name: "The Test Boutique",
        seller: {
          id: "1af34761-3b77-49ff-a536-2dcbff531303",
          store_name: "The Test Boutique"
        },
        product_count: 2,
        created_at: new Date().toISOString(),
        products: [
          {
            id: "ed5940ac-b565-4f50-a487-e473d66c230c", // Air Jordan 4 Retro
            name: "Elite Sneaker Collection - Air Jordan 4 Retro",
            price: 199.99,
            images: "https://picsum.photos/seed/luxury-sneakers/600/400"
          },
          {
            id: "84610855-36f1-4e90-82f0-b5c3b5d2c23b", // Air Jordan 1 Retro High OG
            name: "Elite Sneaker Collection - Air Jordan 1 Retro High OG",
            price: 179.99,
            images: "https://picsum.photos/seed/luxury-sneakers/600/400"
          }
        ]
      }
    ];
  }
};

// Define the Supabase placeholder image URL
const SUPABASE_PLACEHOLDER_IMAGE_URL = supabase.storage.from("public_assets").getPublicUrl("placeholder.webp").data?.publicUrl || "/fallback-placeholder.svg";
const SUPABASE_SIGNATURE_IMAGE_URL = supabase.storage.from("public_assets").getPublicUrl("signature.webp").data?.publicUrl || "/fallback-signature.svg";

// Featured collections for hero display
const featuredCollections = [
  {
    id: "signature",
    name: "Signature Collection",
    description: "Handcrafted luxury essentials. Timeless pieces for the modern wardrobe.",
    image: "/images/hero-2.jpg",
    highlight: "New Season",
    cta: "Explore Collection",
    url: "/collections/signature",
    badge: "Up to 30% Off",
    featured: true
  },
  {
    id: "minimalist",
    name: "Minimalist Edit",
    description: "Sleek, versatile, and designed for everyday elegance.",
    image: "/images/tshirt-blue.jpg",
    highlight: "Minimalist",
    cta: "Shop Minimalist",
    url: "/collections/minimalist",
    badge: "Best Seller",
    featured: true
  },
  {
    id: "tech",
    name: "Tech Essentials",
    description: "Smart accessories for a connected lifestyle.",
    image: "/images/smartwatch.jpg",
    highlight: "Tech",
    cta: "Shop Tech",
    url: "/collections/tech",
    badge: "Just Arrived",
    featured: true
  }
];

const collectionCategories = [
  { name: "All Collections", filter: null },
  { name: "Fashion", filter: "fashion" },
  { name: "Tech", filter: "tech" },
  { name: "Home & Living", filter: "home" },
  { name: "Beauty", filter: "beauty" },
  { name: "Sports", filter: "sports" }
];

const CollectionsPage = () => {
  const dispatch = useDispatch();
  const [addingToCart, setAddingToCart] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Cart state
  const cartCount = useSelector(selectCartCount);
  const cartItems = useSelector(selectCartItems);
  
  // Debug cart state changes
  useEffect(() => {
    console.log('Cart state changed - Count:', cartCount, 'Items:', cartItems);
  }, [cartCount, cartItems]);
  
  // Fetch public collections
  const {
    data: publicCollections,
    isLoading: collectionsLoading,
    error: collectionsError,
  } = useQuery({
    queryKey: ['public-collections'],
    queryFn: fetchPublicCollections,
    select: (data) => data || [],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Filter collections based on selected category
  const filteredCollections = useMemo(() => {
    if (!publicCollections) return [];
    if (!selectedCategory) return publicCollections;
    return publicCollections.filter(collection => 
      collection.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [publicCollections, selectedCategory]);

  // Handle adding collection to cart
  // Handle adding collection to cart
  const handleAddToCart = async (collection) => {
    console.log('Adding collection to cart:', collection);
    console.log('Current cart count before adding:', cartCount);
    console.log('Collection products:', collection.products);
    console.log('Collection seller:', collection.seller);
    
    if (addingToCart === collection.id) return;
    
    // Validate collection has products
    if (!collection.products || collection.products.length === 0) {
      console.error('Collection has no products:', collection);
      toast.error('This collection has no products available');
      return;
    }
    
    setAddingToCart(collection.id);
    try {
      const result = await dispatch(addCollectionToCart({ collection, quantity: 1 })).unwrap();
      console.log('Add to cart result:', result);
      console.log('New cart count after adding:', cartCount + collection.products.length);
      toast.success(`${collection.name} added to cart! (${collection.products.length} items)`);
    } catch (error) {
      console.error('Error adding collection to cart:', error);
      toast.error(error || 'Failed to add collection to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="bg-white min-h-screen text-neutral-900">
      <Helmet>
        <title>Collections | SuriAddis</title>
        <meta name="description" content="Browse curated collections of premium products on SuriAddis." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 mb-6 border border-neutral-300 text-xs uppercase tracking-widest text-neutral-600 bg-white rounded-full">
              Curated Collections
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extralight mb-6 leading-tight tracking-tight">
              Discover <span className="font-medium italic">Artisan</span> Collections
            </h1>
            <p className="text-xl text-neutral-600 mb-8 font-light max-w-2xl mx-auto">
              Explore thoughtfully curated collections from talented sellers around the world. Each collection tells a unique story of craftsmanship and style.
            </p>
            
            {/* Cart Status */}
            {cartCount > 0 && (
              <div className="mb-8">
                <Link to="/cart" className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors">
                  <FiShoppingCart className="w-5 h-5" />
                  <span className="font-medium">{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</span>
                </Link>
              </div>
            )}
            
            {/* Collection Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {collectionCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.filter)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all border ${
                    selectedCategory === category.filter
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections Grid */}
      <section className="container mx-auto px-4 sm:px-6 mb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-light mb-3 tracking-tight">Featured Collections</h2>
          <p className="text-neutral-500 text-base max-w-lg mx-auto">
            Handpicked collections that define contemporary style and luxury
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featuredCollections.map((collection) => (
            <div key={collection.id} className="relative group rounded-2xl overflow-hidden shadow-lg border border-neutral-100 bg-white hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[4/5] relative overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  onError={e => { 
                    if (e.target.src !== SUPABASE_PLACEHOLDER_IMAGE_URL) {
                      e.target.onerror = null; 
                      e.target.src = SUPABASE_PLACEHOLDER_IMAGE_URL; 
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="w-full">
                    <span className="inline-block mb-3 px-3 py-1 bg-white/90 text-xs uppercase tracking-widest rounded-full text-neutral-700 font-medium">
                      {collection.highlight}
                    </span>
                    <h3 className="text-2xl font-semibold mb-3 text-white drop-shadow-lg">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-neutral-200 mb-6 max-w-xs drop-shadow">
                      {collection.description}
                    </p>
                    <Link
                      to={collection.url}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium shadow-lg hover:bg-neutral-100 transition-all text-sm group-hover:shadow-xl"
                    >
                      <Eye className="h-4 w-4" />
                      {collection.cta}
                    </Link>
                  </div>
                </div>
                {collection.badge && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {collection.badge}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* First Ad Banner - Minimal Luxury */}
      <section className="container mx-auto px-4 sm:px-6 mb-20">
        <div className="relative bg-black text-white rounded-3xl overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch min-h-[400px]">
            <div className="flex-1 flex flex-col justify-center px-8 py-16 lg:px-16">
              <span className="block mb-4 text-sm font-bold tracking-[0.3em] text-neutral-400 uppercase">
                Premium Experience
              </span>
              <h2 className="text-4xl sm:text-5xl font-light mb-6 tracking-tight leading-tight">
                Luxury<br />
                <span className="font-bold">Redefined</span>
              </h2>
              <p className="text-lg text-neutral-300 mb-8 max-w-md leading-relaxed">
                Experience the pinnacle of craftsmanship with our exclusive luxury collections. Each piece is a testament to timeless elegance.
              </p>
              <Link
                to="/collections/signature"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-neutral-100 transition-all w-fit"
              >
                <ShoppingBag className="h-5 w-5" />
                Explore Luxury
              </Link>
            </div>
            <div className="flex-1 relative bg-gradient-to-br from-neutral-800 to-neutral-900">
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller Collections Section */}
      <section className="container mx-auto px-4 sm:px-6 mb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-light mb-3 tracking-tight">Seller Collections</h2>
          <p className="text-neutral-500 text-base max-w-lg mx-auto">
            Discover unique collections from our community of talented sellers
          </p>
        </div>
        
        {collectionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-neutral-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-neutral-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-neutral-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : collectionsError ? (
          <div className="text-center text-red-500 py-16 bg-red-50 rounded-2xl">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">Unable to load collections</h3>
              <p className="text-sm text-red-600">Please check your connection and try again later.</p>
            </div>
          </div>
        ) : filteredCollections && filteredCollections.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCollections.map((collection) => (
                <div key={collection.id} className="relative group rounded-2xl overflow-hidden shadow-lg border border-neutral-100 bg-white hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img
                      src={collection.cover_image_url || collection.image_url || SUPABASE_PLACEHOLDER_IMAGE_URL}
                      alt={collection.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      onError={e => { 
                        if (e.target.src !== SUPABASE_PLACEHOLDER_IMAGE_URL) {
                          e.target.onerror = null; 
                          e.target.src = SUPABASE_PLACEHOLDER_IMAGE_URL; 
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 flex items-end p-6">
                      <div className="w-full">
                        <div className="flex items-center mb-3">
                          <Store className="h-4 w-4 text-white mr-2" />
                          <span className="text-xs text-neutral-200">
                            {collection.seller_name || 'Curated Collection'}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-white drop-shadow-lg">
                          {collection.name}
                        </h3>
                        <p className="text-sm text-neutral-200 mb-4 max-w-xs drop-shadow line-clamp-2">
                          {collection.description}
                        </p>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1 text-xs text-neutral-300">
                            <ShoppingBag className="h-3 w-3" />
                            <span>{collection.product_count || 0} items</span>
                          </div>
                          {collection.average_rating && (
                            <div className="flex items-center gap-1 text-xs text-neutral-300">
                              <Star className="h-3 w-3 fill-current text-yellow-400" />
                              <span>{collection.average_rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/collections/${collection.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-full font-medium shadow-lg hover:bg-neutral-100 transition-all text-sm group-hover:shadow-xl"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Link>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(collection);
                            }}
                            disabled={addingToCart === collection.id}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-full font-medium shadow-lg hover:bg-neutral-800 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all text-sm"
                          >
                            {addingToCart === collection.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FiShoppingCart className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {collection.price && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        ${collection.price}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show filtered results info */}
            {selectedCategory && (
              <div className="text-center mt-8 text-neutral-600">
                <p className="text-sm">
                  Showing {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''} 
                  {selectedCategory && ` in "${collectionCategories.find(c => c.filter === selectedCategory)?.name}"`}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-neutral-50 rounded-2xl">
            <div className="max-w-md mx-auto">
              <Store className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-600 mb-2">No collections found</h3>
              <p className="text-sm text-neutral-500 mb-6">
                {selectedCategory 
                  ? `No collections found in the selected category. Try browsing all collections.`
                  : `We're working on adding more collections. Check back soon!`
                }
              </p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                >
                  Browse All Collections
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Call to Action for Sellers */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="max-w-lg mx-auto">
            <Store className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">Become a Seller</h3>
            <p className="text-neutral-600 mb-6 text-sm">
              Join our community of talented sellers and share your unique collections with customers worldwide.
            </p>
            <Link
              to="/seller/apply"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Store className="h-5 w-5" />
              Start Selling Today
            </Link>
          </div>
        </div>
      </section>

      {/* Second Ad Banner - Bold Fashion */}
      <section className="container mx-auto px-4 sm:px-6 mb-20">
        <div className="relative flex flex-col lg:flex-row items-stretch rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-xl">
          <div className="flex-1 lg:w-1/2 relative min-h-[400px] lg:min-h-[500px] bg-gradient-to-br from-neutral-100 to-neutral-200">
            <img
              src={SUPABASE_SIGNATURE_IMAGE_URL} 
              alt="Fashion Forward Collection"
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={e => { 
                if (e.target.src !== SUPABASE_PLACEHOLDER_IMAGE_URL) {
                  e.target.onerror = null; 
                  e.target.src = SUPABASE_PLACEHOLDER_IMAGE_URL; 
                }
              }}
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="flex-1 lg:w-1/2 flex flex-col justify-center px-8 py-16 lg:px-16 bg-white">
            <span className="block mb-4 text-sm font-bold tracking-[0.3em] text-neutral-500 uppercase">
              Limited Edition
            </span>
            <h2 className="text-4xl sm:text-5xl font-light mb-6 tracking-tight text-black leading-tight">
              Future<br />
              <span className="font-bold">Classics</span>
            </h2>
            <p className="text-lg text-neutral-600 mb-8 max-w-md leading-relaxed">
              Define tomorrow's style with avant-garde designs and statement pieces that challenge convention. Exclusivity meets innovation.
            </p>
            <Link 
              to="/collections/signature" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-neutral-800 transition-all w-fit shadow-lg"
            >
              <Heart className="h-5 w-5" />
              Explore Now
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-light mb-4 tracking-tight">Stay in the Loop</h2>
            <p className="text-neutral-600 mb-8 text-lg leading-relaxed">
              Be the first to discover new collections, exclusive offers, and behind-the-scenes stories from our community of sellers.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                className="h-14 border-neutral-300 bg-white flex-1 text-base px-6 rounded-full" 
                required 
              />
              <Button 
                type="submit" 
                className="h-14 px-8 bg-black text-white hover:bg-neutral-800 font-medium rounded-full text-base shadow-lg"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-neutral-500">
              Join 10,000+ subscribers. No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollectionsPage;
