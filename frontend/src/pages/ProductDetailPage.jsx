"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "../components/ui/button"
import { ChevronLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { useDispatch } from "react-redux"
import { addItemToCart } from "../store/cartSlice.js"
import { fetchProductByIdentifier, fetchProducts } from "../services/productApi" // Added fetchProducts
import SkeletonCard from "../components/ui/SkeletonCard.jsx"
import ProductCard from "../components/ui/ProductCard.jsx"; // Added ProductCard
import { formatETB } from "../utils/utils"
import { Helmet } from 'react-helmet'
import { supabase } from "../services/supabaseClient.js";

// Define the Supabase placeholder image URL
const SUPABASE_PLACEHOLDER_IMAGE_URL = supabase.storage.from("public_assets").getPublicUrl("placeholder.webp").data?.publicUrl || "/fallback-placeholder.svg";

// const backendUrl = import.meta.env.VITE_BACKEND_URL || ""; // Old definition
// console.log("ProductDetailPage backendUrl:", backendUrl); // Old log

const viteBackendUrl = import.meta.env.VITE_BACKEND_URL || ""; // This is the base from .env, e.g., https://<project>.supabase.co/storage/v1/object/public
console.log("ProductDetailPage VITE_BACKEND_URL (from .env):", viteBackendUrl);

// Product images are expected to be in the 'products' bucket.
// We append '/products' to the base public storage URL.
const productImagesBaseUrl = viteBackendUrl ? `${viteBackendUrl.replace(/\/$/, '')}/products` : "";
console.log("ProductDetailPage productImagesBaseUrl (for 'products' bucket):", productImagesBaseUrl);

// Star Rating component
const StarRating = ({ rating, reviewCount }) => {
  if (!rating) return null

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
          />
        ))}
      </div>
      {reviewCount > 0 && <span className="text-sm text-gray-500">({reviewCount} reviews)</span>}
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const dispatch = useDispatch()
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null); // New state for selected size
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]); // New state for related products
  const [isLoadingRelatedProducts, setIsLoadingRelatedProducts] = useState(true); // New state for related products loading

  const identifier = params?.identifier

  useEffect(() => {
    if (!identifier) return
    setIsLoading(true)
    setError(null)
    setProduct(null); // Reset product
    setSelectedSize(null); // Reset selected size on new product load
    setRelatedProducts([]); // Reset related products on new product load
    setIsLoadingRelatedProducts(true);

    fetchProductByIdentifier(identifier)
      .then((res) => {
        console.log("Fetched product data (raw response):", res); // Log raw response
        if (res.success && res.data) {
          const dbProduct = res.data;
          console.log("dbProduct from API:", dbProduct); // Log dbProduct
          
          let processedImages = dbProduct.images;
          // Check if dbProduct.images is a string that needs parsing
          if (typeof dbProduct.images === 'string') {
            try {
              processedImages = JSON.parse(dbProduct.images);
            } catch (e) {
              console.error("Failed to parse product images string:", e);
              processedImages = []; // Fallback to empty array if parsing fails
            }
          }
          
          // Ensure processedImages is an array, if not, make it one or default to empty
          if (!Array.isArray(processedImages)) {
            console.warn("Processed images was not an array, defaulting to empty. Original:", dbProduct.images);
            processedImages = [];
          }
          
          const productData = { ...dbProduct, images: processedImages };
          console.log("Processed product object for state:", productData); // Log processed product
          setProduct(productData)

          // Fetch related products after main product is loaded
          if (productData && productData.category?.slug && productData.id) {
            fetchProducts({ 
              category: productData.category.slug,
              limit: 5, // Fetch a few, e.g., 5 (1 current + 4 related)
             })
              .then(relatedRes => {
                if (relatedRes.success && relatedRes.data) {
                  // Filter out the current product from the related list
                  const filteredRelated = relatedRes.data.filter(p => p.id !== productData.id).slice(0, 4);
                  setRelatedProducts(filteredRelated);
                }
              })
              .catch(err => console.error("Failed to fetch related products:", err))
              .finally(() => setIsLoadingRelatedProducts(false));
          } else {
            setIsLoadingRelatedProducts(false); // No category to fetch related products
          }
        } else {
          setError(res.error || "Product not found")
          setIsLoadingRelatedProducts(false);
        }
      })
      .catch((err) => setError(err.message || "Failed to load product"))
      .finally(() => setIsLoading(false))
  }, [identifier])

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, Math.min(product?.stock_quantity || 1, prev + amount)))
  }

  const handleSizeSelect = (size) => { // New handler for size selection
    setSelectedSize(size);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (product?.stock_quantity > 0) {
      // Check if sizes are available and if one is selected
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast.error("Please select a size.");
        return;
      }
      if (isAdding) return
      setIsAdding(true)
      try {
        // Pass selectedSize to the addItemToCart action
        await dispatch(addItemToCart({ product, quantity, selectedSize })).unwrap()
        toast.success(`${quantity} × ${product.name}${selectedSize ? ` (Size: ${selectedSize})` : ''} added to cart!`)
      } catch (err) {
        toast.error(err || 'Failed to add to cart')
      } finally {
        setIsAdding(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          <div className="w-full lg:w-1/2">
            <SkeletonCard />
          </div>
          <div className="w-full lg:w-1/2">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-neutral-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-5/6 mb-2"></div>
              <div className="h-10 bg-neutral-200 rounded w-1/2 mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">{error || "Product not found"}</p>
        <Link to="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ChevronLeft className="mr-1" />
          Browse products
        </Link>
      </div>
    )
  }

  // Determine if size selection should be shown
  // TODO: Refine this condition with specific categories if provided by the user
  const showSizeSelector = product && product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;

  // Prepare short description
  const shortDescription = product.description?.substring(0, 150) + (product.description?.length > 150 ? "..." : "");

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>{product ? `${product.name} | SuriAddis` : 'Product Details | SuriAddis'}</title>
        <meta name="description" content={product ? product.description?.slice(0, 150) : 'View product details, images, price, and reviews.'} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs / Back Navigation */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1.5" />
            Back to Products
          </Link>
        </div>

        {/* Main Product Section: Image Gallery + Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="image-gallery-section">
            <div className="main-image-container bg-white rounded-lg shadow-md overflow-hidden aspect-square mb-4 border border-gray-200">
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
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnail-grid grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-white rounded-md overflow-hidden border-2 transition-all duration-150
                                ${selectedImageIndex === index ? "border-indigo-500 ring-2 ring-indigo-300" : "border-gray-200 hover:border-indigo-400"}`}
                  >
                    <img
                      src={productImagesBaseUrl && image ? `${productImagesBaseUrl}${image}` : SUPABASE_PLACEHOLDER_IMAGE_URL}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={e => { 
                        if (e.target.src !== SUPABASE_PLACEHOLDER_IMAGE_URL) {
                          e.target.onerror = null; 
                          e.target.src = SUPABASE_PLACEHOLDER_IMAGE_URL;
                        }
                      }}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Information */}
          <div className="product-info-section">
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 uppercase tracking-wider mb-2 block"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <StarRating rating={product.rating} reviewCount={product.review_count} />
            </div>

            <div className="price-section mb-5">
              <span className="text-3xl font-extrabold text-gray-900">{formatETB(product.price)}</span>
              {product.original_price && product.price < product.original_price && (
                <span className="ml-3 text-lg text-gray-400 line-through">{formatETB(product.original_price)}</span>
              )}
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-6">{shortDescription}</p>

            <div className="feature-badges flex gap-2 mb-5">
              {product.is_new_arrival && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold">New Arrival</span>}
              {product.is_trending && <span className="bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full text-xs font-semibold">Trending</span>}
              {product.is_featured && <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">Featured</span>}
            </div>

            {/* Size Selector */}
            {showSizeSelector && (
              <div className="size-selector mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Size: <span className="font-semibold">{selectedSize || "Select a size"}</span></h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => handleSizeSelect(size)}
                      className={`px-4 py-2 rounded-md text-sm transition-colors duration-150
                        ${selectedSize === size 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="stock-availability mb-6">
              {product.stock_quantity > 0 ? (
                <span className="text-base text-green-600 font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1.5 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                  In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="text-base text-red-600 font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1.5 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"></path></svg>
                  Out of Stock
                </span>
              )}
            </div>
            
            {product.stock_quantity > 0 && (
              <div className="actions flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                <div className="quantity-selector flex items-center border border-gray-300 rounded-md overflow-hidden h-12">
                  <Button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    variant="ghost"
                    className="px-4 h-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-none"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </Button>
                  <span className="w-12 text-center font-medium text-gray-700">{quantity}</span>
                  <Button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                    variant="ghost"
                    className="px-4 h-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-none"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock_quantity <= 0}
                  className="add-to-cart-button bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md flex items-center justify-center text-base h-12 flex-grow"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section: Details, Specifications, Reviews */}
        <section className="product-details-tabs mt-12 lg:mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-6 -mb-px" aria-label="Tabs">
              {['description', 'specifications', 'reviews'].map((tabName) => (
                <button
                  key={tabName}
                  onClick={() => setActiveTab(tabName)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                    ${activeTab === tabName
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tabName.replace('_', ' ')}
                </button>
              ))}
            </nav>
          </div>
          <div className="tab-content mt-8">
            {activeTab === 'description' && (
              <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-700">
                <p className="whitespace-pre-line">{product.description || "No description available."}</p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Specifications</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  {product.sku && (<li><span className="font-semibold text-gray-800">SKU:</span> {product.sku}</li>)}
                  {product.weight && (<li><span className="font-semibold text-gray-800">Weight:</span> {product.weight}</li>)}
                  {product.dimensions && (<li><span className="font-semibold text-gray-800">Dimensions:</span> {product.dimensions}</li>)}
                  {(!product.sku && !product.weight && !product.dimensions) && (<li>No specifications provided.</li>)}
                </ul>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Reviews</h3>
                <p className="text-sm text-gray-600">Reviews functionality coming soon.</p>
                {/* Placeholder for reviews list and form */}
              </div>
            )}
          </div>
        </section>

        {/* Related Products Section (Placeholder) */}
        <section className="related-products mt-16 lg:mt-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">You Might Also Like</h2>
          {isLoadingRelatedProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No related products found.</p>
          )}
        </section>

      </div>
    </div>
  )
}
