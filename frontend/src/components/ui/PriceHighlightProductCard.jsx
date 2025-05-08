import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addItemToCart, addItemOptimistic, fetchCart } from '../../store/cartSlice.js';
import { formatETB } from '../../utils/utils';

/**
 * @param {{
 *   product: {
 *     id: number,
 *     name: string,
 *     price: number,
 *     images?: string[],
 *     slug: string,
 *     discount?: number | null,
 *     description?: string,
 *     stockQuantity?: number
 *   }
 * }} props
 */
export default function PriceHighlightProductCard({ product }) {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);

  const imageUrl = product.images?.[0]
    ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${product.images[0].startsWith('/') ? '' : '/'}${product.images[0]}`
    : '/placeholder-image.jpg';

  const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This item is currently out of stock.");
      return;
    }
    if (isAdding) return;

    setIsAdding(true);
    const quantity = 1;

    dispatch(addItemOptimistic({ product, quantity }));

    dispatch(addItemToCart({ product, quantity }))
      .unwrap()
      .then(() => toast.success(`${product.name} added to cart!`))
      .catch((err) => {
        toast.error(err || 'Failed to add item. Please try again.');
        dispatch(fetchCart());
      })
      .finally(() => setIsAdding(false));
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${product.name} added to wishlist! (Placeholder)`);
  };

  const finalPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className={`group relative flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden w-full h-full shadow-sm hover:shadow-md transition-all duration-300 ease-in-out ${isOutOfStock ? 'opacity-70' : ''}`}>
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {isOutOfStock && (
          <Badge variant="destructive" className="text-xs px-2 py-0.5">Out of Stock</Badge>
        )}
        {product.discount && !isOutOfStock && (
          <Badge variant="secondary" className="bg-red-600 text-white hover:bg-red-700 text-xs px-2 py-0.5">
            {product.discount}% OFF
          </Badge>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/70 text-neutral-500 hover:bg-white hover:text-red-500 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
        onClick={handleAddToWishlist}
        aria-label="Add to wishlist"
      >
        <Heart className="h-4 w-4" />
      </Button>

      <Link to={`/products/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          onError={(e) => {
            if (e.target.src !== '/placeholder-image.jpg') {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }
          }}
          loading="lazy"
        />
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-medium text-base leading-tight mb-1.5 truncate">
          <Link to={`/products/${product.slug}`} className="hover:text-indigo-700 transition-colors duration-200">
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex-grow"></div>

        {/* Mobile: Price above button, smaller font */}
        <div className="block sm:hidden mb-2">
          {product.discount ? (
            <>
              <span className="text-base font-semibold text-red-600">
                {formatETB(finalPrice)}
              </span>
              <span className="text-xs text-neutral-400 line-through ml-2">
                {formatETB(product.price)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-neutral-800">
              {formatETB(product.price)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex flex-col items-start">
            {/* Desktop: Price and button side by side, original font */}
            {product.discount ? (
              <>
                <span className="hidden sm:block text-lg font-semibold text-red-600">
                  {formatETB(finalPrice)}
                </span>
                <span className="hidden sm:block text-sm text-neutral-400 line-through -mt-1">
                  {formatETB(product.price)}
                </span>
              </>
            ) : (
              <span className="hidden sm:block text-lg font-semibold text-neutral-800">
                {formatETB(product.price)}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant={isOutOfStock ? "secondary" : "default"}
            className={`transition-all text-xs h-9 px-4 rounded-full ${isOutOfStock ? 'cursor-not-allowed bg-neutral-200 text-neutral-500' : 'bg-black text-white hover:bg-neutral-800'}`}
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            aria-label="Add to cart"
          >
            {isAdding ? (
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1.5" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
