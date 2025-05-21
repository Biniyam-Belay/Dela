"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "../components/ui/button"
import { ChevronLeft, Minus, Plus, ShoppingCart, Star, Heart, Share2, Check, ChevronRight } from "lucide-react" // Added ChevronRight
import { useDispatch } from "react-redux"
import { addItemToCart } from "../store/cartSlice.js"
import { fetchProductByIdentifier, fetchProducts } from "../services/productApi"
import SkeletonCard from "../components/ui/SkeletonCard.jsx"
import ProductCard from "../components/ui/ProductCard.jsx"
import { formatETB } from "../utils/utils"
import { Helmet } from 'react-helmet'
import { supabase } from "../services/supabaseClient.js";

const SUPABASE_PLACEHOLDER_IMAGE_URL = supabase.storage.from("public_assets").getPublicUrl("placeholder.webp").data?.publicUrl || "/fallback-placeholder.svg";
const viteBackendUrl = import.meta.env.VITE_BACKEND_URL || "";
const productImagesBaseUrl = viteBackendUrl ? `${viteBackendUrl.replace(/\/$/, '')}/products` : "";

// --- Zoom Effect Constants ---
const LENS_WIDTH = 100;
const LENS_HEIGHT = 100;
const ZOOM_PANE_WIDTH = 400;
const ZOOM_PANE_HEIGHT = 400;
const ZOOM_LEVEL = 2.5;
const GAP_BETWEEN_IMAGE_AND_ZOOM = 20; // in pixels
// --- End Zoom Effect Constants ---

const StarRating = ({ rating, reviewCount }) => {
  if (!rating) return null

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500 ml-1">({reviewCount})</span>
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const dispatch = useDispatch()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('description')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isLoadingRelatedProducts, setIsLoadingRelatedProducts] = useState(true)
  const [isWishlist, setIsWishlist] = useState(false)
  const [copied, setCopied] = useState(false)

  // --- Zoom Effect State & Ref ---
  const mainImageContainerRef = useRef(null);
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // For lens
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 }); // For zoomed image background
  // --- End Zoom Effect State & Ref ---

  const identifier = params?.identifier

  useEffect(() => {
    if (!identifier) return
    setIsLoading(true)
    setError(null)
    setProduct(null)
    setSelectedSize(null)
    setRelatedProducts([])
    setIsLoadingRelatedProducts(true)

    fetchProductByIdentifier(identifier)
      .then((res) => {
        if (res.success && res.data) {
          const dbProduct = res.data;
          
          let processedImages = dbProduct.images;
          if (typeof dbProduct.images === 'string') {
            try {
              processedImages = JSON.parse(dbProduct.images);
            } catch (e) {
              console.error("Failed to parse product images string:", e);
              processedImages = [];
            }
          }
          
          if (!Array.isArray(processedImages)) {
            processedImages = [];
          }
          
          const productData = { ...dbProduct, images: processedImages };
          setProduct(productData)

          if (productData && productData.category?.slug && productData.id) {
            fetchProducts({ 
              category: productData.category.slug,
              limit: 5,
             })
              .then(relatedRes => {
                if (relatedRes.success && relatedRes.data) {
                  const filteredRelated = relatedRes.data.filter(p => p.id !== productData.id).slice(0, 4);
                  setRelatedProducts(filteredRelated);
                }
              })
              .catch(err => console.error("Failed to fetch related products:", err))
              .finally(() => setIsLoadingRelatedProducts(false));
          } else {
            setIsLoadingRelatedProducts(false);
          }
        } else {
          setError(res.error || "Product not found")
          setIsLoadingRelatedProducts(false);
        }
      })
      .catch((err) => setError(err.message || "Failed to load product"))
      .finally(() => setIsLoading(false))
  }, [identifier])

  const handlePrevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setSelectedImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setSelectedImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, Math.min(product?.stock_quantity || 1, prev + amount)))
  }

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (product?.stock_quantity > 0) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast.error("Please select a size.");
        return;
      }
      if (isAdding) return
      setIsAdding(true)
      try {
        await dispatch(addItemToCart({ product, quantity, selectedSize })).unwrap()
        toast.success(`${quantity} × ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''} added to cart!`)
      } catch (err) {
        toast.error(err || 'Failed to add to cart')
      } finally {
        setIsAdding(false)
      }
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Zoom Effect Handlers ---
  const handleMouseEnter = () => {
    // Disable zoom on smaller screens (e.g., less than 1024px, typical for 'lg' breakpoint)
    if (window.innerWidth < 1024) {
      setShowZoom(false);
      return;
    }
    if (mainImageContainerRef.current && product?.images?.[selectedImageIndex]) {
      setShowZoom(true);
    }
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
  };

  const handleMouseMove = (e) => {
    if (!showZoom || !mainImageContainerRef.current || !product?.images?.[selectedImageIndex]) {
      return;
    }

    const rect = mainImageContainerRef.current.getBoundingClientRect();
    
    // Cursor position relative to the image container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const containerWidth = mainImageContainerRef.current.offsetWidth;
    const containerHeight = mainImageContainerRef.current.offsetHeight;

    // Lens positioning (top-left corner)
    let lensX = x - LENS_WIDTH / 2;
    let lensY = y - LENS_HEIGHT / 2;

    // Keep the lens inside the image container
    lensX = Math.max(0, Math.min(lensX, containerWidth - LENS_WIDTH));
    lensY = Math.max(0, Math.min(lensY, containerHeight - LENS_HEIGHT));
    setMousePosition({ x: lensX, y: lensY });

    // Zoomed image background position
    const zoomedImageActualWidth = containerWidth * ZOOM_LEVEL;
    const zoomedImageActualHeight = containerHeight * ZOOM_LEVEL;

    let bgX = -(x * ZOOM_LEVEL - ZOOM_PANE_WIDTH / 2);
    let bgY = -(y * ZOOM_LEVEL - ZOOM_PANE_HEIGHT / 2);

    // Clamp background position
    bgX = Math.max(-(zoomedImageActualWidth - ZOOM_PANE_WIDTH), Math.min(0, bgX));
    bgY = Math.max(-(zoomedImageActualHeight - ZOOM_PANE_HEIGHT), Math.min(0, bgY));
    setZoomPosition({ x: bgX, y: bgY });
  };
  // --- End Zoom Effect Handlers ---


  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-100 aspect-square rounded-xl animate-pulse"></div>
          </div>
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="h-8 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-full w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-full w-5/6 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-full w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{error || "Product not found"}</h2>
          <Link 
            to="/products" 
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ChevronLeft className="mr-1" size={18} />
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  const showSizeSelector = product && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;

  return (
    <div className="bg-white">
      <Helmet>
        <title>{product ? `${product.name} | SuriAddis` : 'Product Details | SuriAddis'}</title>
        <meta name="description" content={product ? product.description?.slice(0, 150) : 'View product details'} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="px-4 sm:px-6 lg:px-8"> {/* Removed max-w-7xl and mx-auto */}
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-indigo-600 hover:text-indigo-800">Home</Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
              </li>
              <li>
                <Link to="/products" className="text-indigo-600 hover:text-indigo-800">Products</Link>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
              </li>
              <li className="text-gray-500 truncate max-w-xs" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 pt-16 md:pt-20"> {/* Removed max-w-7xl and mx-auto, Added pt-16 md:pt-20 for header overlap */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Image Gallery */}
          <div className="lg:w-1/2 relative"> {/* Added relative for zoom pane positioning */}
            <div className="sticky top-4">
              <div 
                ref={mainImageContainerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                className="aspect-square w-full bg-gray-100 rounded-xl overflow-hidden mb-4 relative cursor-crosshair" // Added relative for lens, cursor
              >
                <img
                  src={product.images && product.images.length > 0 && productImagesBaseUrl ? `${productImagesBaseUrl}${product.images[selectedImageIndex]}` : SUPABASE_PLACEHOLDER_IMAGE_URL}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={e => { 
                    if (e.target.src !== SUPABASE_PLACEHOLDER_IMAGE_URL) {
                      e.target.onerror = null; 
                      e.target.src = SUPABASE_PLACEHOLDER_IMAGE_URL;
                    }
                  }}
                  loading="lazy"
                />
                {/* Lens */}
                {showZoom && product?.images?.[selectedImageIndex] && mainImageContainerRef.current && (
                  <div
                    style={{
                      position: 'absolute',
                      border: '2px solid rgba(255, 255, 255, 0.7)',
                      boxShadow: '0 0 5px rgba(0,0,0,0.3)',
                      width: `${LENS_WIDTH}px`,
                      height: `${LENS_HEIGHT}px`,
                      left: `${mousePosition.x}px`,
                      top: `${mousePosition.y}px`,
                      pointerEvents: 'none',
                      // backgroundColor: 'rgba(255,255,255,0.1)', // Optional: slight lens tint
                    }}
                  />
                )}
                {/* Arrow Navigation */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute top-1/2 left-2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute top-1/2 right-2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white rounded-full transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Zoomed Image Display Pane */}
            {showZoom && product?.images?.[selectedImageIndex] && mainImageContainerRef.current && (
              <div
                className="hidden lg:block" // Ensures it's hidden on screens smaller than lg
                style={{
                  position: 'absolute',
                  left: `calc(100% + ${GAP_BETWEEN_IMAGE_AND_ZOOM}px)`,
                  top: 0,
                  width: `${ZOOM_PANE_WIDTH}px`,
                  height: `${ZOOM_PANE_HEIGHT}px`,
                  border: '1px solid #e0e0e0',
                  backgroundImage: `url(${productImagesBaseUrl}${product.images[selectedImageIndex]})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: `${zoomPosition.x}px ${zoomPosition.y}px`,
                  backgroundSize: `${mainImageContainerRef.current.offsetWidth * ZOOM_LEVEL}px ${mainImageContainerRef.current.offsetHeight * ZOOM_LEVEL}px`,
                  zIndex: 50,
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden', // Ensure content doesn't spill
                }}
              />
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2">
            <div className="space-y-6">
              <div>
                {product.category && (
                  <Link 
                    to={`/products?category=${product.category.slug}`} 
                    className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                  >
                    {product.category.name}
                  </Link>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 mb-2">{product.name}</h1> {/* Adjusted font size for mobile */}
                
                <div className="flex items-center justify-between">
                  <StarRating rating={product.rating} reviewCount={product.review_count} />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsWishlist(!isWishlist)}
                      className={`p-2 rounded-full ${isWishlist ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Heart className={`${isWishlist ? 'fill-current' : ''}`} size={20} />
                    </button>
                    <button 
                      onClick={handleShare}
                      className="p-2 rounded-full text-gray-400 hover:text-gray-600"
                    >
                      {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap"> {/* Added flex-wrap and adjusted gap for responsiveness */}
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {formatETB(product.price)}
                  </span>
                  {product.original_price && product.price < product.original_price && (
                    <span className="text-lg sm:text-xl text-gray-400 line-through"> {/* Adjusted font size */}
                      {formatETB(product.original_price)}
                    </span>
                  )}
                  {product.original_price && product.price < product.original_price && (
                    <span className="bg-red-100 text-red-700 text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md"> {/* Adjusted padding, font-weight, color */}
                      {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </span>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap pt-1"> {/* Added flex-wrap and pt-1 for spacing */}
                  {product.is_new_arrival && (
                    <span className="bg-green-100 text-green-700 text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-md"> {/* Adjusted padding, font-weight, color */}
                      New Arrival
                    </span>
                  )}
                  {product.is_trending && (
                    <span className="bg-pink-100 text-pink-700 text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-md"> {/* Adjusted padding, font-weight, color */}
                      Trending
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-md"> {/* Adjusted padding, font-weight, color */}
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <p className="text-gray-700 leading-relaxed">
                  {product.description?.substring(0, 200) + (product.description?.length > 200 ? "..." : "")}
                </p>
              </div>

              {/* Size Selector */}
              {showSizeSelector && (
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${selectedSize === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock & Add to Cart */}
              <div className="pt-6 space-y-6">
                <div className={`flex items-center text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock_quantity > 0 ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      In stock ({product.stock_quantity} available)
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Out of stock
                    </>
                  )}
                </div>

                {product.stock_quantity > 0 && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-fit"> {/* Added w-fit */}
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-700">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock_quantity}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <Button
                      onClick={handleAddToCart}
                      disabled={isAdding || (showSizeSelector && !selectedSize)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
                    >
                      <ShoppingCart className="mr-2" size={18} />
                      {isAdding ? "Adding..." : "Add to Cart"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="mt-12">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-2"> {/* Added overflow-x-auto, adjusted spacing, added pb-2 for scrollbar */} 
                  {['description', 'specifications', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 whitespace-nowrap border-b-2 font-medium text-sm capitalize ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} /* Added whitespace-nowrap */
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="py-6">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line text-gray-700">{product.description || "No description available."}</p>
                  </div>
                )}
                {activeTab === 'specifications' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {product.sku && <li><span className="font-medium text-gray-900">SKU:</span> {product.sku}</li>}
                      {product.weight && <li><span className="font-medium text-gray-900">Weight:</span> {product.weight}</li>}
                      {product.dimensions && <li><span className="font-medium text-gray-900">Dimensions:</span> {product.dimensions}</li>}
                      {(!product.sku && !product.weight && !product.dimensions) && <li>No specifications provided.</li>}
                    </ul>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                    <p className="text-sm text-gray-600">Reviews functionality coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          {isLoadingRelatedProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"> {/* Added xl:grid-cols-5 for wider screens */}
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"> {/* Added xl:grid-cols-5 for wider screens */}
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No related products found.</p>
          )}
        </section>
      </div>
    </div>
  )
}