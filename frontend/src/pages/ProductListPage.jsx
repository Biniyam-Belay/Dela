import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
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
import { ScrollArea } from "../components/ui/scroll-area"
import ProductCard from "../components/ui/ProductCard.jsx";
import SkeletonCard from "../components/ui/SkeletonCard.jsx";

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
import { supabase } from "../services/supabaseClient.js" // Import supabase

// Define the Supabase placeholder image URL
const SUPABASE_PLACEHOLDER_IMAGE_URL = supabase.storage.from("public_assets").getPublicUrl("placeholder.webp").data?.publicUrl || "/fallback-placeholder.svg";

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

export default function ProductListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrice, setSelectedPrice] = useState(null)
  const [sort, setSort] = useState(sortOptions[0].value)
  const viewMode = "grid"; // Set directly as it's not changed
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
    const sortParams = new URLSearchParams(searchParams.toString()) // Renamed variable
    sortParams.set("sort", value)
    sortParams.set("page", "1")
    navigate(`/products?${sortParams.toString()}`, { replace: true })
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
    <>
      <Helmet>
        <title>Products - Suri Addis</title>
        <meta name="description" content="Browse our collection of exclusive products." />
      </Helmet>
      <div className="bg-gray-50 min-h-screen">
        {/* Header Placeholder - Assuming a global header is used */}
        {/* <Header /> */}

        {/* Breadcrumbs & Title */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <nav className="text-sm mb-3" aria-label="Breadcrumb">
              <ol className="list-none p-0 inline-flex space-x-2">
                <li className="flex items-center">
                  <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
                  <ChevronRight size={16} className="text-gray-400 mx-1" />
                </li>
                <li className="flex items-center">
                  <span className="text-gray-700 font-medium">Products</span>
                </li>
              </ol>
            </nav>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {searchParams.get("category") 
                    ? categories.find(c => c.slug === searchParams.get("category"))?.name || "Products" 
                    : "All Products"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Showing {products.length > 0 ? ((page - 1) * 6) + 1 : 0}-{(page - 1) * 6 + products.length} of {totalProducts} results
                </p>
              </div>
              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  type="search"
                  name="search"
                  defaultValue={search || ""}
                  placeholder="Search products..."
                  className="w-full sm:w-64"
                />
                <Button type="submit" variant="outline" size="icon" aria-label="Search">
                  <Search size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar (Desktop) */}
            <aside className="hidden lg:block lg:w-1/4 xl:w-1/5 space-y-6">
              {FilterSidebar}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1">
              {/* Toolbar: Sort, View Mode, Mobile Filter Trigger */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4 sm:mb-0">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <Select value={sort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Mobile Filter Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden w-full sm:w-auto h-9">
                      <Filter size={16} className="mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[360px] p-0">
                    <SheetHeader className="p-5 border-b">
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Refine your product search</SheetDescription>
                    </SheetHeader>
                    <div className="h-[calc(100vh-80px)] overflow-y-auto">
                      {FilterSidebar}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Product Grid / List */}
              {isLoading ? (
                <div className={`grid gap-x-6 gap-y-8 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
                </div>
              ) : products.length > 0 ? (
                <motion.div
                  layout
                  className={`grid gap-x-6 gap-y-8 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
                >
                  <AnimatePresence>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <Mail size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No Products Found</h3>
                  <p className="text-gray-500 mb-6">
                    We couldn't find any products matching your current filters. Try adjusting your search or filters.
                  </p>
                  <Button onClick={handleClearFilters}>Clear Filters</Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="icon"
                      onClick={() => handlePageChange(p)}
                      aria-label={`Go to page ${p}`}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Go to next page"
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  )
}
