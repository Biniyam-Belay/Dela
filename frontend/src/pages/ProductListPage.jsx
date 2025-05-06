import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useDispatch } from "react-redux"
import toast from "react-hot-toast"
import { Helmet } from "react-helmet"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Checkbox } from "../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "../components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Skeleton } from "../components/ui/productSkeleton.tsx"
import { ScrollArea } from "../components/ui/scroll-area"

import {
  Search,
  Filter,
  Tag,
  DollarSign,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
  Eye,
  X,
  Mail,
} from "lucide-react"

import { fetchProducts, fetchCategories } from "../services/productApi.js"
import { addItemToCart } from "../store/cartSlice"
import { addToWishlist } from "../store/wishlistSlice"
import { formatETB } from "../utils/utils"

const priceRanges = [
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 - $300", min: 100, max: 300 },
  { label: "$300 - $500", min: 300, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1000 },
  { label: "$1000+", min: 1000, max: null },
]

const sortOptions = [
  { label: "Newest", value: "created_at_desc" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
  { label: "Most Popular", value: "popularity_desc" },
  { label: "Best Rating", value: "rating_desc" },
]

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={`${
            i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"
          } ${i === Math.floor(rating) && rating % 1 > 0 ? "text-yellow-400 fill-yellow-400" : ""}`}
        />
      ))}
    </div>
  )
}

// Product Card Component
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlistProcessing, setIsWishlistProcessing] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const imageUrl = product.images && product.images[0]
    ? `${backendUrl}${product.images[0].startsWith("/") ? "" : "/"}${product.images[0]}`
    : "https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.webp";

  const handleAddToCart = async () => {
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

  const handleAddToWishlist = async () => {
    if (isWishlistProcessing) return;
    setIsWishlistProcessing(true);
    try {
      await dispatch(addToWishlist(product.id)).unwrap();
      toast.success(`${product.name} added to wishlist!`);
    } catch (err) {
      toast.error(err?.message || 'Failed to add to wishlist.');
    } finally {
      setIsWishlistProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Quick Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm" onClick={handleAddToWishlist} disabled={isWishlistProcessing} aria-label={`Add ${product.name} to wishlist`}>
          <Heart size={16} className="text-gray-700" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm" aria-label={`Quick view of ${product.name}`}>
          <Eye size={16} className="text-gray-700" />
          <span className="sr-only">Quick view</span>
        </Button>
      </div>

      {/* Product Image */}
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-gray-100" aria-label={`View details for ${product.name}`}> 
        <img
          src={imageUrl}
          alt={product.name || 'Product image'}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          style={{ width: '100%', height: '100%' }}
          onError={e => { e.target.onerror = null; e.target.src = "https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.webp"; }}
          loading="lazy"
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
                    {formatETB(product.price * (1 - product.discount / 100))}
                  </span>
                  <span className="text-sm text-gray-400 line-through">{formatETB(product.price)}</span>
                </div>
              </>
            ) : (
              <span className="text-lg font-semibold text-gray-900">{formatETB(product.price)}</span>
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
    </motion.div>
  );
}

// Loading Skeleton for Product Card
const ProductCardSkeleton = () => (
  <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm">
    <div className="relative aspect-square bg-gray-100">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-5 w-full mb-1" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-24 mb-3" />
      <div className="mt-auto flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-16 rounded-full" />
      </div>
    </div>
  </div>
)

export default function ProductListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrice, setSelectedPrice] = useState(null)
  const [sort, setSort] = useState(sortOptions[0].value)
  const [viewMode, setViewMode] = useState("grid")
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    tags: [],
    availability: [],
  })
  const [selectedRating, setSelectedRating] = useState(null)
  const [products, setProducts] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState([])

  // Fetch all categories on mount
  useEffect(() => {
    fetchCategories().then((res) => {
      setCategories(res.data || [])
    }).catch(() => setCategories([]))
  }, [])

  // Extract filter params
  const page = Number(searchParams.get("page")) || 1
  const search = searchParams.get("search") || undefined

  // Simulate loading
  useEffect(() => {
    setIsLoading(true)
    const params = {
      page,
      limit: 6,
      search,
      sort,
      ...(selectedFilters.categories.length === 1 ? { category: selectedFilters.categories[0] } : {}),
      ...(selectedPrice && selectedPrice.min !== null ? { price_gte: selectedPrice.min } : {}),
      ...(selectedPrice && selectedPrice.max !== null ? { price_lte: selectedPrice.max } : {}),
      // Availability filter
      ...(selectedFilters.availability.length === 1
        ? selectedFilters.availability[0] === "in-stock"
          ? { in_stock: true }
          : { in_stock: false }
        : {}),
      // Rating filter
      ...(selectedRating ? { min_rating: selectedRating } : {}),
    }
    fetchProducts(params).then((res) => {
      setProducts(res.data || [])
      setTotalProducts(res.count || 0)
      setTotalPages(res.totalPages || 1)
      setIsLoading(false)
    }).catch(() => {
      setProducts([])
      setTotalProducts(0)
      setTotalPages(1)
      setIsLoading(false)
    })
  }, [page, search, sort, selectedFilters.categories, selectedPrice, selectedFilters.availability, selectedRating])

  const updateFiltersInUrl = (newFilters) => {
    const params = new URLSearchParams(searchParams.toString())
    // Categories
    if (newFilters.categories && newFilters.categories.length > 0) {
      params.set("category", newFilters.categories[0]) // Only single category for now
    } else {
      params.delete("category")
    }
    // Price
    if (newFilters.selectedPrice) {
      params.set("price", newFilters.selectedPrice.label)
    } else {
      params.delete("price")
    }
    // Availability (not in URL for now)
    params.set("page", "1")
    navigate(`/products?${params.toString()}`, { replace: true })
  }

  const handleCategoryFilter = (categorySlug) => {
    setSelectedFilters((prev) => {
      const alreadySelected = prev.categories.includes(categorySlug)
      const newCategories = alreadySelected ? [] : [categorySlug]
      const newFilters = { ...prev, categories: newCategories }
      updateFiltersInUrl({ ...newFilters, selectedPrice })
      return newFilters
    })
  }

  const handleAvailabilityFilter = (value) => {
    setSelectedFilters((prev) => {
      const newAvailability = prev.availability.includes(value)
        ? prev.availability.filter((a) => a !== value)
        : [...prev.availability, value]
      const newFilters = { ...prev, availability: newAvailability }
      return newFilters
    })
  }

  const handlePriceFilter = (range) => {
    setSelectedPrice((prev) => {
      const newPrice = prev === range ? null : range
      updateFiltersInUrl({ ...selectedFilters, selectedPrice: newPrice })
      return newPrice
    })
  }

  const handleSortChange = (value) => {
    setSort(value)
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    params.set("page", "1")
    navigate(`/products?${params.toString()}`, { replace: true })
  }

  const handleRatingFilter = (rating) => {
    setSelectedRating((prev) => (prev === rating ? null : rating))
  }

  const handleClearFilters = () => {
    setSelectedFilters({
      categories: [],
      tags: [],
      availability: [],
    })
    setSelectedPrice(null)
    setSelectedRating(null)
    setSort(sortOptions[0].value)

    const params = new URLSearchParams()
    params.set("page", "1")
    navigate(`/products?${params.toString()}`)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return; // Prevent invalid page changes
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchTerm = formData.get("search")
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    navigate(`/products?${params.toString()}`, { replace: true })
  }

  // Filter sidebar content
  const FilterSidebar = (
    <div className="w-full bg-white rounded-xl overflow-hidden">
      <div className="p-5 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Filters</h2>
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 text-xs">
            Clear All
          </Button>
        </div>
        <p className="text-sm text-gray-500">Refine your product search</p>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)] py-2">
        <Accordion type="multiple" defaultValue={["categories", "price", "availability", "ratings"]} className="px-5">
          {/* Categories Filter */}
          <AccordionItem value="categories" className="border-b">
            <AccordionTrigger className="py-4 text-base hover:no-underline">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-gray-500" />
                <span>Categories</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${cat.slug}`}
                      checked={selectedFilters.categories.includes(cat.slug)}
                      onCheckedChange={() => handleCategoryFilter(cat.slug)}
                    />
                    <label
                      htmlFor={`category-${cat.slug}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full"
                    >
                      <span>{cat.name}</span>
                      <span className="text-gray-500">
                        ({products.filter(p => p.category && p.category.slug === cat.slug).length})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Filter */}
          <AccordionItem value="price" className="border-b">
            <AccordionTrigger className="py-4 text-base hover:no-underline">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-gray-500" />
                <span>Price</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-2">
                <div className="space-y-2">
                  {priceRanges.map((range, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Checkbox
                        id={`price-${i}`}
                        checked={selectedPrice === range}
                        onCheckedChange={() => handlePriceFilter(range)}
                      />
                      <label
                        htmlFor={`price-${i}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Availability Filter */}
          <AccordionItem value="availability" className="border-b">
            <AccordionTrigger className="py-4 text-base hover:no-underline">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-gray-500" />
                <span>Availability</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock"
                    checked={selectedFilters.availability.includes("in-stock")}
                    onCheckedChange={() => handleAvailabilityFilter("in-stock")}
                  />
                  <label
                    htmlFor="in-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    In Stock
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="out-of-stock"
                    checked={selectedFilters.availability.includes("out-of-stock")}
                    onCheckedChange={() => handleAvailabilityFilter("out-of-stock")}
                  />
                  <label
                    htmlFor="out-of-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Out of Stock
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ratings Filter */}
          <AccordionItem value="ratings" className="border-b">
            <AccordionTrigger className="py-4 text-base hover:no-underline">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-gray-500" />
                <span>Ratings</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {[4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={selectedRating === rating}
                      onCheckedChange={() => handleRatingFilter(rating)}
                    />
                    <label
                      htmlFor={`rating-${rating}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                    >
                      <div className="flex mr-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"}
                          />
                        ))}
                      </div>
                      <span>& Up</span>
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <Helmet>
        <title>Shop Products | SuriAddis</title>
        <meta name="description" content="Discover our curated collection of premium products. Filter, search, and shop the best items for your needs." />
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 md:pt-32">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">Shop Products</h1>
          <p className="text-gray-500">Discover our curated collection of premium products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-72 shrink-0 sticky top-24 self-start">{FilterSidebar}</div>

          {/* Sidebar - Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden mb-4 gap-2">
                <Filter size={16} />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[350px] p-0">
              <SheetHeader className="p-5 border-b">
                <SheetTitle className="text-left">Filters</SheetTitle>
                <SheetDescription className="text-left">Refine your product search</SheetDescription>
              </SheetHeader>
              {FilterSidebar}
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="search"
                    name="search"
                    placeholder="Search products..."
                    defaultValue={search || ""}
                    className="pl-10 pr-4 py-2 h-11 border-gray-200 rounded-lg w-full"
                  />
                </div>
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                  Search
                </Button>
              </form>
              <div className="flex items-center gap-3">
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] h-11">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="hidden sm:flex border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-11 w-11 rounded-none ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-11 w-11 rounded-none ${viewMode === "list" ? "bg-gray-100" : ""}`}
                    onClick={() => setViewMode("list")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" x2="21" y1="6" y2="6" />
                      <line x1="3" x2="21" y1="12" y2="12" />
                      <line x1="3" x2="21" y1="18" y2="18" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedFilters.categories.length > 0 ||
              selectedFilters.availability.length > 0 ||
              selectedPrice ||
              selectedRating ||
              search) && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-500 mr-1">Active Filters:</span>
                {selectedFilters.categories.map((cat) => {
                  const category = categories.find((c) => c.slug === cat)
                  return (
                    <Badge key={cat} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                      {category?.name}
                      <X size={14} className="cursor-pointer" onClick={() => handleCategoryFilter(cat)} />
                    </Badge>
                  )
                })}
                {selectedFilters.availability.map((avail) => (
                  <Badge key={avail} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                    {avail === "in-stock" ? "In Stock" : "Out of Stock"}
                    <X size={14} className="cursor-pointer" onClick={() => handleAvailabilityFilter(avail)} />
                  </Badge>
                ))}
                {selectedPrice && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                    {selectedPrice.label}
                    <X size={14} className="cursor-pointer" onClick={() => handlePriceFilter(null)} />
                  </Badge>
                )}
                {selectedRating && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                    {selectedRating} stars & up
                    <X size={14} className="cursor-pointer" onClick={() => setSelectedRating(null)} />
                  </Badge>
                )}
                {search && (
                  <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                    Search: {search}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString())
                        params.delete("search")
                        navigate(`/products?${params.toString()}`)
                      }}
                    />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="ml-auto text-xs h-7" onClick={handleClearFilters}>
                  Clear All
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Showing {products.length} of {totalProducts} products
              </p>
              {totalProducts > 0 && (
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && products.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">No Products Found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your current filters. Try adjusting your search or filters.
                </p>
                <Button onClick={handleClearFilters} className="bg-black hover:bg-gray-800 text-white">
                  Clear Filters & Search
                </Button>
              </div>
            )}

            {/* Product Grid */}
            {!isLoading && products.length > 0 && (
              <div
                className={
                  viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
                }
              >
                <AnimatePresence>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  aria-label="Previous Page"
                  className={`h-10 w-10 ${page <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600"}`}
                >
                  <ChevronLeft size={18} />
                </Button>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1
                  const showPage = pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - page) <= 1
                  const showEllipsis = Math.abs(pageNum - page) === 2 && totalPages > 5
                  if (showEllipsis) {
                    return (
                      <span key={`ellipsis-${pageNum}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    )
                  }
                  if (showPage) {
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        aria-current={pageNum === page ? "page" : undefined}
                        className={`h-10 w-10 ${
                          pageNum === page
                            ? "bg-black text-white hover:bg-gray-800"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  }
                  return null
                })}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  aria-label="Next Page"
                  className={`h-10 w-10 ${
                    page >= totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600"
                  }`}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="rounded-2xl bg-white shadow-lg flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
          <div className="flex-1 text-gray-900">
            <h2 className="text-2xl sm:text-3xl font-light mb-4">Join Our Community</h2>
            <p className="mb-6 max-w-md text-gray-700">
              Subscribe for exclusive deals, early access to new products, and personalized recommendations.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="h-12 border-0 bg-gray-100 rounded-full pl-11 pr-4 flex-1 text-gray-900 w-full"
                  required
                />
              </div>
              <Button className="h-12 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition">
                Subscribe
              </Button>
            </form>
          </div>
          <div className="relative w-40 h-40 md:w-56 md:h-56 shrink-0 flex items-center justify-center">
            <img
              src="/images/hero-2.jpg"
              alt="Newsletter"
              className="object-cover rounded-xl shadow-lg w-full h-full"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl font-light mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className="group bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full overflow-hidden">
                <img
                  src={category.image_url ? `${import.meta.env.VITE_BACKEND_URL || ''}${category.image_url.startsWith('/') ? '' : '/'}${category.image_url}` : "https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.webp"}
                  alt={category.name}
                  className="object-cover group-hover:scale-110 transition-transform"
                  style={{ width: '100%', height: '100%' }}
                  onError={e => { e.target.onerror = null; e.target.src = "https://exutmsxktrnltvdgnlop.supabase.co/storage/v1/object/public/public_assets/placeholder.webp"; }}
                />
              </div>
              <h3 className="font-medium text-sm group-hover:text-indigo-600 transition-colors">{category.name}</h3>
              <p className="text-xs text-gray-500">{products.filter(p => p.category && p.category.slug === category.slug).length} products</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
