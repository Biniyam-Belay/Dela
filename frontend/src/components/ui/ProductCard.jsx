import { useState } from "react"
import { Link } from "react-router-dom"
import { Heart, ShoppingCart, Star, Eye } from "lucide-react"
import { Button } from "./button"
import { Badge } from "./badge"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"
import { addItemToCart } from "../../store/cartSlice.js"

// Star Rating Component
const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300 fill-gray-300"
        }
      />
    ))}
  </div>
)

/**
 * @param {{ 
 *   product: { 
 *     id: number, 
 *     name: string, 
 *     price: number, 
 *     images?: string[],
 *     slug: string, 
 *     discount?: number | null, 
 *     rating?: number, 
 *     reviewCount?: number,
 *     stockQuantity?: number
 *   }, 
 *   featured?: boolean 
 * }} props
 */
export default function ProductCard({ product, featured = false }) {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const imageUrl = product.images && product.images[0]
    ? `${backendUrl}${product.images[0].startsWith("/") ? "" : "/"}${product.images[0]}`
    : "/placeholder-image.jpg";

  const handleAddToCart = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (product.stockQuantity !== undefined && product.stockQuantity <= 0) {
      toast.error("This item is currently out of stock.");
      return;
    }
    if (isAdding) return;
    setIsAdding(true);
    try {
      await dispatch(addItemToCart({ product, quantity: 1 })).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${product.name} added to wishlist! (Placeholder)`);
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Quick Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm" onClick={handleAddToWishlist}>
          <Heart size={16} className="text-gray-700" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm">
          <Eye size={16} className="text-gray-700" />
          <span className="sr-only">Quick view</span>
        </Button>
      </div>

      {/* Product Image */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          style={{ width: '100%', height: '100%' }}
          onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
        />
        {product.discount > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-3 left-3 font-medium px-2.5 py-1 rounded-md"
          >{`${product.discount}% OFF`}</Badge>
        )}
        {product.isNew && (
          <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-2.5 py-1 rounded-md">
            NEW
          </Badge>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="outline" className="bg-white text-black font-medium px-3 py-1.5 text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-auto">
          {product.category && (
            <Link to={`/products?category=${product.category.slug}`}>
              <Badge variant="outline" className="mb-2 text-xs font-normal">
                {product.category.name}
              </Badge>
            </Link>
          )}
          <h3 className="font-medium text-base leading-tight mb-1 hover:text-indigo-600 transition-colors">
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.discount ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-gray-900">
                    ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
            )}
          </div>
          <Button
            size="sm"
            disabled={product.stockQuantity === 0 || isAdding}
            onClick={handleAddToCart}
            className={`rounded-full ${
              product.stockQuantity === 0 || isAdding ? "bg-gray-200 text-gray-500" : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            <ShoppingCart size={16} className="mr-1" />
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}
