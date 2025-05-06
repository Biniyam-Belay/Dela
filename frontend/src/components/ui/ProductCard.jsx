import { useState } from "react"
import { Link } from "react-router-dom"
import { ShoppingCart, Star, Heart } from "lucide-react"
import { Button } from "./button"
import { Badge } from "./badge"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast"
import { addItemToCart } from "../../store/cartSlice.js"
import { addToWishlist, removeFromWishlist } from "../../store/wishlistSlice.js"
import { formatETB } from "../../utils/utils"

const StarRating = ({ rating }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : "text-neutral-300 fill-neutral-300"
        }
      />
    ))}
  </div>
)

/**
 * @param {{ 
 *   product: { 
 *     id: number | string, 
 *     name: string, 
 *     price: number, 
 *     images?: string[],
 *     slug: string, 
 *     discount?: number | null, 
 *     stockQuantity?: number,
 *     rating?: number,
 *     category?: { name: string, slug: string }
 *   },
 *   className?: string
 * }} props
 */
export default function ProductCard({ product, className = "" }) {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlistProcessing, setIsWishlistProcessing] = useState(false);

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isInWishlist = wishlistItems.some(item => item.product_id === product.id);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const imageUrl = product.images && product.images[0]
    ? `${backendUrl}${product.images[0].startsWith("/") ? "" : "/"}${product.images[0]}`
<<<<<<< HEAD
    : 'https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.webp';
=======
    : "/placeholder-image.jpg";
>>>>>>> mergeFix

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

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlistProcessing) return;
    setIsWishlistProcessing(true);

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product.id)).unwrap();
        toast.success(`${product.name} removed from wishlist.`);
      } else {
        await dispatch(addToWishlist(product.id)).unwrap();
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (err) {
      toast.error(err || `Failed to update wishlist.`);
    } finally {
      setIsWishlistProcessing(false);
    }
  };

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-lg overflow-hidden border border-neutral-200 hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/70 text-neutral-500 hover:bg-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 ${isInWishlist ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
        onClick={handleToggleWishlist}
        disabled={isWishlistProcessing}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500' : 'fill-none'}`} />
      </Button>

      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-neutral-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          style={{ width: '100%', height: '100%' }}
<<<<<<< HEAD
          onError={e => { e.target.onerror = null; e.target.src = 'https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.webp'; }}
=======
          onError={e => { e.target.onerror = null; e.target.src = '/placeholder-image.jpg'; }}
>>>>>>> mergeFix
        />
        {product.discount > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-3 left-3 font-medium px-2.5 py-1 rounded-md bg-red-500 text-white text-xs"
          >{`${product.discount}% OFF`}</Badge>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Badge variant="outline" className="bg-neutral-100 border border-neutral-300 text-neutral-600 font-medium px-3 py-1 text-sm rounded-md">
              Out of Stock
            </Badge>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-auto">
          {product.category && (
            <Link to={`/products?category=${product.category.slug}`} className="text-xs text-neutral-500 hover:text-black transition-colors mb-1 block">
              {product.category.name}
            </Link>
          )}
          <h3 className="font-medium text-base leading-snug mb-2 hover:text-indigo-600 transition-colors">
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          {product.rating !== undefined && product.rating > 0 && (
            <div className="mb-3">
              <StarRating rating={product.rating} />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {product.discount ? (
              <>
                <span className="text-lg font-semibold text-neutral-900">
                  {formatETB(product.price * (1 - product.discount / 100))}
                </span>
                <span className="text-sm text-neutral-400 line-through">{formatETB(product.price)}</span>
              </>
            ) : (
              <span className="text-lg font-semibold text-neutral-900">{formatETB(product.price)}</span>
            )}
          </div>
          <Button
            size="sm"
            disabled={product.stockQuantity === 0 || isAdding}
            onClick={handleAddToCart}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
              product.stockQuantity === 0 || isAdding
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-800 text-white hover:bg-black"
            }`}
          >
            <ShoppingCart size={14} className="mr-1.5" />
            {isAdding ? "Adding..." : (product.stockQuantity === 0 ? "Out of Stock" : "Add")}
          </Button>
        </div>
      </div>
    </div>
  );
}
