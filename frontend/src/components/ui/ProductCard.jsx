"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { FiStar, FiShoppingBag, FiHeart } from "react-icons/fi"
import { getImageUrl, placeholderImageUrl } from "../../utils/imageUrl"
import { addItemOptimistic, addItemToCart, fetchCart } from "../../store/cartSlice"
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlist, setIsWishlist] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  if (!product) return null

  const id = product.id || ""
  const slug = product.slug || id
  const displayName = typeof product.name === "object" ? product.name.name : product.name
  const displayCategory = typeof product.category === "object" ? product.category.name : product.category
  const imageUrl = getImageUrl(product.images?.[0])
  const price = product.price || 0
  const isNew = product.isNew || false
  const discount = product.discount || 0
  const rating = product.rating || 4.5
  const reviewCount = product.reviewCount || 12

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={`star-${i}`} className="w-3 h-3 fill-current text-yellow-500" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative">
          <FiStar className="w-3 h-3 text-neutral-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <FiStar className="w-3 h-3 fill-current text-yellow-500" />
          </div>
        </div>,
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} className="w-3 h-3 text-neutral-300" />)
    }

    return stars
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAdding) return
    setIsAdding(true)
    const productToAdd = { id, name: displayName, price, images: product.images, slug }
    dispatch(addItemOptimistic({ product: productToAdd, quantity: 1 }))
    dispatch(addItemToCart({ product: productToAdd, quantity: 1 }))
      .unwrap()
      .then(() => toast.success(`${displayName} added to cart!`))
      .catch((err) => {
        toast.error(err || 'Failed to add to cart');
        dispatch(fetchCart()); // Revert optimistic update by re-fetching cart
      })
      .finally(() => setIsAdding(false))
  }

  const toggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlist(!isWishlist)
  }

  const handleImageError = (e) => {
    e.target.onerror = null
    e.target.src = placeholderImageUrl
  }

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative overflow-hidden aspect-[3/4]">
        <Link to={`/products/${slug}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={displayName || "Product"}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? "scale-105" : "scale-100"}`}
            onError={handleImageError}
            loading="lazy"
          />
        </Link>

        {isNew && !discount && <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded">New</div>}
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1 rounded">{discount}% Off</div>
        )}

        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 h-8 w-8 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-600 transition-colors duration-300 hover:bg-white hover:text-black"
          aria-label="Toggle Wishlist"
        >
          <FiHeart className={`w-4 h-4 ${isWishlist ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      <div className="mt-4">
        <div>
          {displayCategory && <p className="text-sm text-neutral-500 mb-1">{displayCategory}</p>}
          <h3 className="font-light text-base mb-1">
            <Link to={`/products/${slug}`} className="hover:text-black transition-colors">
              {displayName || "Product"}
            </Link>
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex">{renderStars(rating)}</div>
            <span className="text-xs text-neutral-500 ml-1">({reviewCount})</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {discount > 0 ? (
              <>
                <p className="font-medium">${(price * (1 - discount / 100)).toFixed(2)}</p>
                <p className="text-sm text-neutral-500 line-through">${price.toFixed(2)}</p>
              </>
            ) : (
              <p className="font-medium">${price.toFixed(2)}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
          aria-label="Add to cart"
        >
          <FiShoppingBag className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default ProductCard
