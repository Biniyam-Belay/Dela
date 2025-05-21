import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom" // Removed useNavigate
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
  { label: "Under 5,000 ETB", min: 0, max: 5000 },
  { label: "5,000 - 15,000 ETB", min: 5000, max: 15000 },
  { label: "15,000 - 25,000 ETB", min: 15000, max: 25000 },
  { label: "25,000 - 50,000 ETB", min: 25000, max: 50000 },
  { label: "50,000+ ETB", min: 50000, max: null },
];

export default function ProductListPage() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSearch, setCurrentSearch] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(null);
  const viewMode = "grid";
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    tags: [],
  });
  const [selectedRating, setSelectedRating] = useState(null);

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  // Fetch all categories on mount
  useEffect(() => {
    fetchCategories().then((res) => {
      setCategories(res.data || []);
    }).catch(() => setCategories([]));
  }, []);

  // Effect 1: Sync URL query params to component state (on initial load and browser navigation)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setCurrentPage(Number(searchParams.get("page")) || 1);
    setCurrentSearch(searchParams.get("search") || '');
    
    const priceLabel = searchParams.get("price");
    if (priceLabel) {
      setSelectedPrice(priceRanges.find(r => r.label === priceLabel) || null);
    } else {
      setSelectedPrice(null);
    }

    const categorySlug = searchParams.get("category");
    setSelectedFilters(prev => ({ ...prev, categories: categorySlug ? [categorySlug] : [] }));
    
    const rating = searchParams.get("min_rating");
    setSelectedRating(rating ? Number(rating) : null);
  }, [location.search]);


  // Effect 2: Fetch products when filter states change, and update URL
  useEffect(() => {
    setIsLoading(true);
    const params = {
      page: currentPage,
      limit: 6,
      search: currentSearch || undefined,
      ...(selectedFilters.categories.length === 1 ? { category: selectedFilters.categories[0] } : {}),
      ...(selectedPrice && selectedPrice.min !== null ? { price_gte: selectedPrice.min } : {}),
      ...(selectedPrice && selectedPrice.max !== null ? { price_lte: selectedPrice.max } : {}),
      ...(selectedRating ? { min_rating: selectedRating } : {}),
    };
    fetchProducts(params).then((res) => {
      setProducts(res.data || []);
      setTotalProducts(res.count || 0);
      setTotalPages(res.totalPages || 1);
      setIsLoading(false);

      // Update URL after fetching
      const newUrlParams = new URLSearchParams();
      if (currentPage > 1) newUrlParams.set("page", currentPage.toString());
      if (currentSearch) newUrlParams.set("search", currentSearch);
      if (selectedFilters.categories.length > 0) newUrlParams.set("category", selectedFilters.categories[0]);
      if (selectedPrice) newUrlParams.set("price", selectedPrice.label);
      if (selectedRating) newUrlParams.set("min_rating", selectedRating.toString());
      
      const newSearchString = newUrlParams.toString();
      if (location.search.substring(1) !== newSearchString) {
        window.history.pushState({}, '', `${location.pathname}?${newSearchString}`);
      }
    }).catch(() => {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      setIsLoading(false);
    });
  }, [currentPage, currentSearch, selectedFilters, selectedPrice, selectedRating, location.pathname]); // Removed location.search from dependencies

  const handleCategoryFilter = (categorySlug) => {
    setSelectedFilters((prev) => {
      const alreadySelected = prev.categories.includes(categorySlug);
      const newCategories = alreadySelected ? [] : [categorySlug];
      return { ...prev, categories: newCategories };
    });
    setCurrentPage(1);
  };

  const handlePriceFilter = (range) => {
    setSelectedPrice((prev) => (prev === range ? null : range));
    setCurrentPage(1);
  }

  const handleRatingFilter = (rating) => {
    setSelectedRating((prev) => (prev === rating ? null : rating));
    setCurrentPage(1);
  }

  const handleClearFilters = () => {
    setSelectedFilters({
      categories: [],
      tags: [],
    })
    setSelectedPrice(null)
    setSelectedRating(null)
    setCurrentSearch('');
    setCurrentPage(1);
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleSearch = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchTerm = formData.get("search")?.toString() || '';
    setCurrentSearch(searchTerm);
    setCurrentPage(1);
  }

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
        <Accordion type="multiple" defaultValue={["categories", "price", "ratings"]} className="px-5">
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
      <div className="bg-gray-50 min-h-screen pt-20">
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
                  {selectedFilters.categories.length > 0 && categories.length > 0
                    ? categories.find(c => c.slug === selectedFilters.categories[0])?.name || "Products" 
                    : "All Products"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Showing {products.length > 0 ? ((currentPage - 1) * 6) + 1 : 0}-{(currentPage - 1) * 6 + products.length} of {totalProducts} results
                </p>
              </div>
              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  type="search"
                  name="search"
                  defaultValue={currentSearch} // Use state for defaultValue
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
            <aside className="hidden lg:block lg:w-1/4 xl:w-1/5 space-y-6">
              {FilterSidebar}
            </aside>

            <main className="flex-1">
              <div className="mb-6 lg:hidden flex justify-end"> {/* Container for mobile filter button */}
                <Sheet>
                  <SheetTrigger asChild>
                    {/* Keeping lg:hidden on the button itself to ensure consistent behavior with its original w-full/sm:w-auto styling below lg breakpoint */}
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

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={currentPage === p ? "default" : "outline"}
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
