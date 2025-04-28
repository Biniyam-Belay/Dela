"use client"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { supabase } from "../utils/supabaseClient"
import {
  ArrowRight,
  Star,
  Truck,
  RefreshCw,
  ChevronDown,
  ShoppingBag,
  Clock,
  Search,
  ShoppingCart,
  User,
} from "lucide-react"

import { Button } from "../components/ui/button"
import ProductCard from "../components/ui/ProductCard.jsx"
import SkeletonCard from "../components/ui/SkeletonCard.jsx"
import ErrorMessage from "../components/common/ErrorMessage.jsx"
import { Input } from "../components/ui/input"
import { fetchProducts, fetchCategories } from "../services/productApi"

// Hero Section
const HeroSection = () => {
  const [heroImageUrl, setHeroImageUrl] = useState("/placeholder.svg?height=1200&width=2000")

  useEffect(() => {
    // Get the public URL for the hero image directly from the bucket
    const { data } = supabase.storage.from("public_assets").getPublicUrl("landing.jpg")
    if (data?.publicUrl) {
      setHeroImageUrl(data.publicUrl)
    }
  }, [])

  return (
    <section className="relative h-screen max-h-[1000px] flex items-center overflow-hidden bg-black pt-16 md:pt-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <img
          src={heroImageUrl}
          alt="Luxury fashion collection"
          className="object-cover object-center w-full h-full"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 mb-6 border border-white/30 text-xs uppercase tracking-widest text-white">
            Fall Collection 2025
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight text-white mb-6 leading-tight tracking-tight">
            Redefine Your <span className="font-medium">Wardrobe</span>
          </h1>
          <p className="text-lg lg:text-xl text-neutral-300 mb-10 font-light max-w-lg">
            Curated essentials that transcend seasons and elevate your everyday style with timeless elegance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="px-8 py-4 bg-white text-black font-medium hover:bg-neutral-100 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center"
            >
              Shop Now
            </Link>
            <Link
              to="/new-arrivals"
              className="px-8 py-4 border border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center"
            >
              New Arrivals
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white">
            <ChevronDown />
          </div>
        </div>
      </div>
    </section>
  )
}

// Category Showcase Section
const CategoryShowcase = () => {
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories", { limit: 3 }],
    queryFn: () => fetchCategories({ limit: 3 }),
    select: (data) => (data?.data || []).slice(0, 3),
  })

  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">Shop by Category</h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto">
            Explore our curated collections designed for every occasion
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <ErrorMessage message="Could not load categories" />
        ) : categoriesData && categoriesData.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:gap-6">
            {categoriesData.map((category) => (
              <Link
                to={`/products?category=${category.slug}`}
                key={category.id}
                className="group flex-shrink-0 w-40 md:w-48 lg:w-52 relative overflow-hidden rounded-xl shadow border border-neutral-200 bg-white transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                style={{ minWidth: '10rem', maxWidth: '13rem' }}
              >
                <div className="aspect-[3/4] overflow-hidden relative rounded-t-xl">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="transition-transform duration-700 group-hover:scale-110 object-cover w-full h-full"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                    onError={e => { e.target.onerror = null; e.target.src = "https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.jpg"; }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 rounded-xl">
                  <div>
                    <h3 className="text-white text-base font-semibold mb-1 drop-shadow">{category.name}</h3>
                    <span className="inline-flex items-center text-white text-xs border-b border-white/50 pb-0.5 group-hover:border-white transition-colors">
                      Shop <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500">No categories found.</p>
        )}
      </div>
    </section>
  )
}

// Trending Products Section
const TrendingProducts = () => {
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", { limit: 8, page: 1 }],
    queryFn: () => fetchProducts({ limit: 8 }),
    select: (data) => data?.data || [],
  })

  return (
    <section className="container mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-light text-neutral-800 tracking-tight">Trending Now</h2>
          <p className="text-neutral-500 mt-2 max-w-md">
            This season's most coveted pieces, curated for the modern wardrobe
          </p>
        </div>
        <Link
          to="/trending"
          className="group flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          View all <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <ErrorMessage message="Could not load products" />
        ) : productsData.length > 0 ? (
          productsData.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p className="col-span-full text-center text-neutral-500">No trending products available</p>
        )}
      </div>
    </section>
  )
}

// Featured Banner Section
const FeaturedBanner = () => (
  <section className="py-20 bg-neutral-950 text-white">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block px-3 py-1 mb-6 border border-white/30 text-xs uppercase tracking-widest">
            Limited Edition
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight mb-6 leading-tight tracking-tight">
            Handcrafted Luxury <br />
            Essentials
          </h2>
          <p className="text-neutral-400 mb-8 max-w-lg">
            Our signature collection features ethically sourced materials and artisanal craftsmanship. Each piece tells
            a story of tradition and innovation, designed to last for generations.
          </p>
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-neutral-400">On orders over $150</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-neutral-400">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Limited Time</p>
                <p className="text-xs text-neutral-400">While supplies last</p>
              </div>
            </div>
          </div>
          <Link
            to="/collections/signature"
            className="inline-flex items-center px-8 py-3 bg-white text-black hover:bg-neutral-100 transition-colors"
          >
            Explore Collection
          </Link>
        </div>
        <div className="relative">
          <div className="aspect-[3/4] relative">
            <img
              src={supabase.storage.from("public_assets").getPublicUrl("signature.jpg").data.publicUrl || "/placeholder.svg?height=800&width=600"}
              alt="Signature Collection"
              className="object-cover w-full h-full"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              onError={e => { e.target.onerror = null; e.target.src = "https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.jpg"; }}
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white text-black py-3 px-6 shadow-lg">
            <p className="text-sm font-medium">New Season</p>
            <p className="text-2xl font-light">Up to 30% Off</p>
          </div>
        </div>
      </div>
    </div>
  </section>
)

// Brand Highlights
const BrandHighlights = () => (
  <section className="bg-neutral-950 text-white py-24">
    <div className="container mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-light text-center text-white mb-16 tracking-tight">Our Promise</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="text-center group">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-full border border-white/20 text-white group-hover:border-white/50 transition-all duration-300">
              <Star className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-xl font-light text-white mb-3">Premium Quality</h3>
          <p className="text-neutral-400 max-w-xs mx-auto">Only the finest materials and craftsmanship</p>
        </div>
        <div className="text-center group">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-full border border-white/20 text-white group-hover:border-white/50 transition-all duration-300">
              <Truck className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-xl font-light text-white mb-3">Fast Shipping</h3>
          <p className="text-neutral-400 max-w-xs mx-auto">Delivered to your door in 2-3 days</p>
        </div>
        <div className="text-center group">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-full border border-white/20 text-white group-hover:border-white/50 transition-all duration-300">
              <RefreshCw className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-xl font-light text-white mb-3">Easy Returns</h3>
          <p className="text-neutral-400 max-w-xs mx-auto">30-day hassle-free returns</p>
        </div>
      </div>
    </div>
  </section>
)

// Featured Products Section
const FeaturedProducts = () => {
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", { limit: 4, featured: true }],
    queryFn: () => fetchProducts({ limit: 4 }),
    select: (data) => data?.data || [],
  })

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">Featured Products</h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto">
            Discover our most popular items loved by customers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <ErrorMessage message="Could not load featured products" />
          ) : productsData.length > 0 ? (
            productsData.map((product) => <ProductCard key={product.id} product={product} featured />)
          ) : (
            <p className="col-span-full text-center text-neutral-500">No featured products available</p>
          )}
        </div>
      </div>
    </section>
  )
}

// Newsletter Section
const NewsletterSection = () => (
  <section className="py-24 bg-neutral-100">
    <div className="container mx-auto px-6 max-w-4xl text-center">
      <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-tight">Join Our Community</h2>
      <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
        Subscribe to receive exclusive updates, early access to new collections, and personalized style recommendations.
      </p>

      <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Your email address"
          className="h-12 border-neutral-300 bg-transparent"
          required
        />
        <Button type="submit" className="h-12 px-6 bg-black text-white hover:bg-black/90 font-light">
          Subscribe
        </Button>
      </form>

      <p className="text-xs text-neutral-500 mt-4">
        By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
      </p>
    </div>
  </section>
)

// Customer Reviews Section
const CustomerReviews = () => {
  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      comment:
        "The quality of their products is exceptional. I've been a loyal customer for years and have never been disappointed.",
      date: "2 weeks ago",
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 5,
      comment:
        "Fast shipping and the packaging was beautiful. The attention to detail really shows how much they care about the customer experience.",
      date: "1 month ago",
    },
    {
      id: 3,
      name: "Emma Williams",
      rating: 4,
      comment: "Love the minimalist design aesthetic. These pieces integrate perfectly into my existing wardrobe.",
      date: "2 months ago",
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">What Our Customers Say</h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto">Real experiences from our valued customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="border border-neutral-200 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`}
                  />
                ))}
              </div>
              <p className="text-neutral-700 mb-4">"{review.comment}"</p>
              <div className="flex justify-between items-center">
                <p className="font-medium">{review.name}</p>
                <p className="text-sm text-neutral-500">{review.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/reviews" className="inline-flex items-center text-neutral-700 hover:text-neutral-900">
            View all reviews <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Main HomePage Component
export default function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <CategoryShowcase />
      <TrendingProducts />
      <FeaturedBanner />
      <FeaturedProducts />
      <BrandHighlights />
      <CustomerReviews />
      <NewsletterSection />
    </div>
  )
}
