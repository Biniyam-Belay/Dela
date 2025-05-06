"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { Button } from "../components/ui/button"
import { ChevronLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { useDispatch } from "react-redux"
import { addItemToCart } from "../store/cartSlice.js"
import { fetchProductByIdentifier } from "../services/productApi"
import SkeletonCard from "../components/ui/SkeletonCard.jsx"
import { formatETB } from "../utils/utils"
import { Helmet } from 'react-helmet'

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
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)

  const identifier = params?.identifier

  useEffect(() => {
    if (!identifier) return
    setIsLoading(true)
    setError(null)
    fetchProductByIdentifier(identifier)
      .then((res) => {
        if (res.success && res.data) {
          const dbProduct = res.data
          setProduct({
            ...dbProduct,
            stockQuantity: dbProduct.stock_quantity,
            originalPrice: dbProduct.original_price,
            reviewCount: dbProduct.review_count,
          })
        } else {
          setError(res.error || "Product not found")
        }
      })
      .catch((err) => setError(err.message || "Failed to load product"))
      .finally(() => setIsLoading(false))
  }, [identifier])

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, Math.min(product?.stockQuantity || 1, prev + amount)))
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (product?.stockQuantity > 0) {
      if (isAdding) return
      setIsAdding(true)
      try {
        await dispatch(addItemToCart({ product, quantity })).unwrap()
        toast.success(`${quantity} × ${product.name} added to cart!`)
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>{product ? `${product.name} | SuriAddis` : 'Product Details | SuriAddis'}</title>
        <meta name="description" content={product ? product.description?.slice(0, 150) : 'View product details, images, price, and reviews.'} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/products"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors text-sm sm:text-base"
          >
            <ChevronLeft className="mr-1.5" size={18} />
            Back to Products
          </Link>
        </div>

        {/* Product Container - Responsive Flex */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Image Gallery - Responsive Width */}
          <div className="w-full lg:w-1/2">
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-4 aspect-square">
              <div className="relative w-full h-full">
                <img
                  src={product.images && product.images[selectedImage] ? product.images[selectedImage] : "/placeholder-image.jpg"}
                  alt={product.name || 'Product image'}
                  className="object-contain p-4 sm:p-8 w-full h-full"
                  style={{ aspectRatio: 1 }}
                  onError={e => { e.target.src = "/placeholder-image.jpg"; }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-md overflow-hidden border ${
                      selectedImage === index
                        ? "border-indigo-500 ring-1 ring-indigo-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={img || "/placeholder-image.jpg"}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="object-cover w-full h-full"
                        style={{ aspectRatio: 1 }}
                        onError={e => { e.target.src = "/placeholder-image.jpg"; }}
                        loading="lazy"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Responsive Width */}
          <div className="w-full lg:w-1/2">
            {/* Category */}
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="inline-block text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 uppercase tracking-wider mb-2"
              >
                {product.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />

            {/* Price */}
            <div className="mb-5 sm:mb-6">
              <span className="text-2xl sm:text-3xl font-medium text-gray-900">{formatETB(product.price)}</span>
              {product.originalPrice && product.price < product.originalPrice && (
                <span className="text-base sm:text-lg text-gray-400 line-through ml-3">
                  {formatETB(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="prose max-w-none text-gray-600 mb-6 sm:mb-8">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            {/* Stock Status */}
            <p className={`text-sm sm:text-base mb-6 ${product.stockQuantity > 0 ? "text-green-600" : "text-red-500"}`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} available in stock` : "Currently out of stock"}
            </p>

            {/* Quantity Selector */}
            {product.stockQuantity > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center">
                  <label htmlFor="quantity" className="sr-only">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <Button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      variant="ghost"
                      size="icon"
                      className="p-2 sm:p-3 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={18} />
                    </Button>
                    <span className="w-12 text-center py-1 sm:py-2 font-medium">{quantity}</span>
                    <Button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockQuantity}
                      variant="ghost"
                      size="icon"
                      className="p-2 sm:p-3 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                </div>

                {/* Add to Cart */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stockQuantity <= 0}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    product.stockQuantity > 0
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={18} />
                  {isAdding ? "Adding..." : product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Details</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {product.sku && (
                  <li>
                    <span className="font-medium">SKU:</span> {product.sku}
                  </li>
                )}
                {product.weight && (
                  <li>
                    <span className="font-medium">Weight:</span> {product.weight}
                  </li>
                )}
                {product.dimensions && (
                  <li>
                    <span className="font-medium">Dimensions:</span> {product.dimensions}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
