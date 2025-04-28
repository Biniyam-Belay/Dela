"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "./button"
import { Badge } from "./badge"

/**
 * @param {{ 
 *   product: { 
 *     id: number, 
 *     name: string, 
 *     price: number, 
 *     image: string, 
 *     slug: string, 
 *     discount?: number | null, 
 *     rating?: string, 
 *     reviewCount?: number 
 *   }, 
 *   featured?: boolean 
 * }} props
 */
export default function ProductCard({ product, featured = false }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`group relative ${featured ? "border border-neutral-200 rounded-lg overflow-hidden" : ""} w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-neutral-100 h-64 sm:h-72 md:h-80 lg:h-96">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="object-cover transition-transform duration-500 group-hover:scale-105 w-full h-full"
            style={{ objectFit: "cover" }}
            onError={e => { e.target.onerror = null; e.target.src = "https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.jpg"; }}
          />
        </Link>

        {product.discount && (
          <Badge className="absolute top-3 left-3 bg-black text-white hover:bg-black">{product.discount}% OFF</Badge>
        )}

        <div
          className={`absolute right-3 top-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 bg-white hover:bg-white/90">
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 bg-white p-3 transform transition-transform duration-300 ${
            isHovered ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <Button className="w-full bg-black hover:bg-black/90 text-white">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <div className={`py-4 ${featured ? "px-4" : ""}`}>
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Number.parseInt(product.rating) ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500">({product.reviewCount})</span>
          </div>
        )}

        <h3 className="font-medium text-sm">
          <Link to={`/products/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>

        <div className="mt-1 flex items-center gap-2">
          {product.discount ? (
            <>
              <span className="font-medium">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
              <span className="text-neutral-500 line-through text-sm">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="font-medium">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
