"use client"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState, useCallback } from "react"
import { supabase } from "../services/supabaseClient"
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import useEmblaCarousel from 'embla-carousel-react'

import { Button } from "../components/ui/button"
import ProductCard from "../components/ui/ProductCard.jsx"
import SkeletonCard from "../components/ui/SkeletonCard.jsx"
import ErrorMessage from "../components/common/ErrorMessage.jsx"
import { Input } from "../components/ui/input"
import { fetchProducts, fetchCategories } from "../services/productApi"
import Header from '../components/layout/Header'
import CategorySkeletonCard from "../components/ui/CategorySkeletonCard.jsx"

// Font stack for flowing, harmonious look
const flowingSerif = '"Playfair Display", "Georgia", serif';
const flowingSans = '"Inter", "Helvetica Neue", Arial, sans-serif';

// Ultra-luxury Hero Section with psychological triggers
const HeroSection = () => {
  const [heroImageUrl, setHeroImageUrl] = useState("/placeholder.svg?height=1200&width=2000")

  useEffect(() => {
    const { data } = supabase.storage.from("public_assets").getPublicUrl("landing.jpg")
    if (data?.publicUrl) setHeroImageUrl(data.publicUrl)
  }, [])

  return (
    <section className="relative min-h-screen h-screen flex items-center justify-center bg-black overflow-hidden border-b border-neutral-900">
      <img
        src={heroImageUrl}
        alt="Luxury essentials for you"
        className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale"
        style={{ zIndex: 0, filter: 'brightness(0.7)' }}
      />
      {/* Gradient overlay: solid on left, fades to transparent on right */}
      <div className="absolute inset-0" style={{zIndex:1, background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0.01) 100%)'}} />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-36 flex flex-col md:flex-row items-center md:items-stretch gap-0">
        {/* Left: Text */}
        <div className="flex-1 flex flex-col justify-center items-start text-left md:pr-16">
          <span className="uppercase tracking-widest text-xs text-neutral-400 mb-6 block font-light" style={{letterSpacing: '0.25em'}}>By Invitation Only</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-thin text-white mb-8 tracking-tight leading-tight" style={{letterSpacing: '-0.05em', fontFamily: 'serif', textShadow: '0 2px 24px rgba(0,0,0,0.18)'}}>
            The Art of Rarity
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-neutral-200 mb-10 max-w-2xl font-light" style={{lineHeight:1.35, textShadow: '0 1px 12px rgba(0,0,0,0.12)'}}>
            Unveil a world reserved for the few. Each piece is a statement—crafted for legacy, owned by visionaries. This is your moment to possess the exceptional.
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 sm:px-12 sm:py-5 bg-white text-black text-sm sm:text-xl font-semibold rounded-full shadow hover:bg-neutral-100 transition-colors tracking-wide border border-neutral-200"
            style={{boxShadow: '0 4px 20px 0 rgba(0,0,0,0.10)'}}
            aria-label="Begin Your Collection"
          >
            Begin Your Collection
          </Link>
          <div className="mt-10 text-base text-neutral-300 font-light tracking-wide italic">
            Discreetly delivered. Unmistakably yours.
          </div>
          <div className="mt-4 text-xs text-neutral-500 font-light tracking-wider">
            Trusted by connoisseurs in 30+ countries
          </div>
        </div>
        {/* Right: Image (kept for layout balance, but image is background) */}
        <div className="hidden md:block flex-1" />
      </div>
    </section>
  )
}

// New Ad Banner Section
const AdBanner = () => (
  <section className="w-full bg-gradient-to-r from-amber-100 via-white to-emerald-100 py-6 border-b border-neutral-200">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-3 px-4 text-center md:text-left">
      {/* Mobile: Small, non-scrollable, stacked horizontally with spacing */}
      <div className="flex w-full md:hidden flex-row items-center justify-center gap-2">
        <div className="flex flex-col items-center flex-1 min-w-0 bg-white/80 rounded-lg shadow p-2 border border-neutral-200">
          <Truck className="h-6 w-6 text-emerald-600 mb-1" />
          <span className="font-semibold text-neutral-900 text-xs mb-0.5">Fast Delivery</span>
          <span className="text-[10px] text-neutral-500 leading-tight">2-3 days</span>
        </div>
        <div className="flex flex-col items-center flex-1 min-w-0 bg-white/80 rounded-lg shadow p-2 border border-neutral-200">
          <Star className="h-6 w-6 text-amber-500 mb-1" />
          <span className="font-semibold text-neutral-900 text-xs mb-0.5">Premium</span>
          <span className="text-[10px] text-neutral-500 leading-tight">Curated only</span>
        </div>
        <div className="flex flex-col items-center flex-1 min-w-0 bg-white/80 rounded-lg shadow p-2 border border-neutral-200">
          <RefreshCw className="h-6 w-6 text-blue-500 mb-1" />
          <span className="font-semibold text-neutral-900 text-xs mb-0.5">Easy Returns</span>
          <span className="text-[10px] text-neutral-500 leading-tight">30-day</span>
        </div>
      </div>
      {/* Desktop: Original layout */}
      <div className="hidden md:flex flex-row items-center justify-center gap-6 w-full">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-emerald-600" />
          <span className="font-medium text-neutral-800">Tired of slow delivery?</span>
          <span className="text-neutral-500 ml-2">Get your order in 2-3 days.</span>
        </div>
        <div className="h-6 w-px bg-neutral-300 mx-4" />
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 text-amber-500" />
          <span className="font-medium text-neutral-800">Worried about quality?</span>
          <span className="text-neutral-500 ml-2">Premium, curated products only.</span>
        </div>
        <div className="h-6 w-px bg-neutral-300 mx-4" />
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-blue-500" />
          <span className="font-medium text-neutral-800">Returns a hassle?</span>
          <span className="text-neutral-500 ml-2">Enjoy 30-day easy returns.</span>
        </div>
      </div>
    </div>
  </section>
)

// White-themed, seamless Category Showcase Section with Carousel
const CategoryShowcase = () => {
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    select: (data) => data?.data || [],
  })

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Helper function to get the public URL from Supabase storage
  const getCategoryImageUrl = (imagePath) => {
    if (!imagePath) {
      return '/placeholder-image.jpg';
    }
    // Remove leading slash if present
    let path = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    // Remove leading 'categories/' if present, as getPublicUrl adds the bucket name
    if (path.startsWith('categories/')) {
      path = path.substring('categories/'.length);
    }
    const { data } = supabase.storage.from('categories').getPublicUrl(path);
    return data?.publicUrl || '/placeholder-image.jpg';
  };

  return (
    <section className="py-20 bg-white border-b border-neutral-200 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-thin text-neutral-900 mb-2 tracking-tight text-left" style={{letterSpacing: '-0.04em', fontFamily: 'serif', textTransform: 'uppercase', lineHeight: 1.1}}>Shop by Category</h2>
            <p className="text-base text-neutral-500 font-light max-w-xl text-left">
              Discover our signature collections—each curated for those who demand distinction.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="rounded-full border-neutral-300 hover:bg-neutral-100"
              aria-label="Previous category"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="rounded-full border-neutral-300 hover:bg-neutral-100"
              aria-label="Next category"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 -ml-2 pl-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-48 md:w-52 lg:w-56">
                  <CategorySkeletonCard />
                </div>
              ))
            ) : error ? (
              <div className="w-full">
                <ErrorMessage message="Could not load categories" />
              </div>
            ) : categoriesData && categoriesData.length > 0 ? (
              categoriesData.map((category) => (
                <div key={category.id} className="flex-shrink-0 w-48 md:w-52 lg:w-56">
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="group block h-64 rounded-xl overflow-hidden relative shadow-md border border-neutral-200 bg-white hover:shadow-xl hover:border-black/15 transition-all duration-300"
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)' }}
                  >
                    <img
                      src={getCategoryImageUrl(category.image_url)}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover object-center opacity-80 group-hover:opacity-90 transition-opacity duration-300 scale-100 group-hover:scale-105"
                      style={{ zIndex: 0, transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)' }}
                      onError={e => {
                        if (e.target.src !== '/placeholder-image.jpg') {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }
                      }}
                    />
                    <div className="absolute inset-0" style={{zIndex:1, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.0) 100%)'}} />
                    <div className="relative z-10 flex flex-col justify-end h-full p-4">
                      <h3 className="text-base font-thin text-white mb-1 tracking-tight" style={{fontFamily: 'serif', letterSpacing: '-0.03em', textShadow: '0 1px 8px rgba(0,0,0,0.4)', textTransform: 'uppercase'}}>{category.name}</h3>
                      <span className="text-neutral-100 text-xs font-light mb-2" style={{textShadow: '0 1px 6px rgba(0,0,0,0.3)'}}>
                        {category.description ? category.description.substring(0, 40) + (category.description.length > 40 ? '...' : '') : 'Curated selection'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-white text-[11px] font-medium border-b border-white/30 pb-0.5 group-hover:border-white transition-colors w-fit" style={{textShadow: '0 1px 6px rgba(0,0,0,0.2)'}}>
                        Explore <ArrowRight className="ml-0.5 h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="w-full">
                <p className="text-left text-neutral-500">No categories found.</p>
              </div>
            )}
          </div>
        </div>
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
    <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-neutral-800 tracking-tight" style={{fontFamily: flowingSerif}}>
            Trending Now
          </h2>
          <p className="text-neutral-500 mt-2 max-w-md text-sm sm:text-base" style={{fontFamily: flowingSans}}>
            This season's most coveted pieces, curated for the modern wardrobe
          </p>
        </div>
        <Link
          to="/trending"
          className="group flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm sm:text-base"
        >
          View all <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 w-full max-w-full">
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
  <section className="py-12 sm:py-20 bg-neutral-950 text-white">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div>
          <div className="inline-block px-3 py-1 mb-6 border border-white/30 text-xs uppercase tracking-widest">
            Limited Edition
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight mb-6 leading-tight tracking-tight" style={{fontFamily: flowingSerif}}>
            Handcrafted Luxury <br />
            Essentials
          </h2>
          <p className="text-neutral-400 mb-8 max-w-lg text-sm sm:text-base" style={{fontFamily: flowingSans}}>
            Our signature collection features ethically sourced materials and artisanal craftsmanship. Each piece tells
            a story of tradition and innovation, designed to last for generations.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 mb-8">
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
            className="inline-flex items-center px-6 sm:px-8 py-3 bg-white text-black hover:bg-neutral-100 transition-colors text-base sm:text-lg"
          >
            Explore Collection
          </Link>
        </div>
        <div className="relative">
          <div className="aspect-[3/4] relative">
            <img
              src={supabase.storage.from("public_assets").getPublicUrl("signature.jpg").data.publicUrl || "/placeholder.svg?height=800&width=600"}
              alt="Signature Collection"
              className="object-cover w-full h-full rounded-lg"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              onError={e => { e.target.onerror = null; e.target.src = "https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.jpg"; }}
            />
          </div>
          <div className="absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-6 bg-white text-black py-2 sm:py-3 px-4 sm:px-6 shadow-lg text-xs sm:text-base">
            <p className="text-xs sm:text-sm font-medium">New Season</p>
            <p className="text-lg sm:text-2xl font-light">Up to 30% Off</p>
          </div>
        </div>
      </div>
    </div>
  </section>
)

// Brand Highlights
const BrandHighlights = () => (
  <section className="bg-neutral-950 text-white py-16 sm:py-24">
    <div className="container mx-auto px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-center text-white mb-10 sm:mb-16 tracking-tight" style={{fontFamily: flowingSerif}}>Our Promise</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
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
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight" style={{fontFamily: flowingSerif}}>Featured Products</h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto text-sm sm:text-base" style={{fontFamily: flowingSans}}>
            Discover our most popular items loved by customers worldwide
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
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
  <section className="py-16 sm:py-24 bg-neutral-100">
    <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-4 tracking-tight" style={{fontFamily: flowingSerif}}>Join Our Community</h2>
      <p className="text-neutral-600 mb-8 max-w-xl mx-auto text-sm sm:text-base" style={{fontFamily: flowingSans}}>
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
  // TODO: Replace hardcoded reviews with real data from backend in production
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
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight" style={{fontFamily: flowingSerif}}>What Our Customers Say</h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto text-sm sm:text-base" style={{fontFamily: flowingSans}}>Real experiences from our valued customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
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

        <div className="text-center mt-8 sm:mt-10">
          <Link to="/reviews" className="inline-flex items-center text-neutral-700 hover:text-neutral-900 text-sm sm:text-base">
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
      <Header isHero={true} />
      <HeroSection />
      <AdBanner />
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
