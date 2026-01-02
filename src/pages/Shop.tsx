import { useState, useEffect, useMemo } from "react";
import { Filter, Grid, List, Star, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import woodFrameProduct from "@/assets/wood-frame-product.jpg";
import { useSearchParams } from "react-router-dom";

interface FilterState {
  categories: string[];
  sizes: string[];
  minRating: number;
  priceRange: [number, number];
}

interface FilterCounts {
  categories: Record<string, number>;
  sizes: Record<string, number>;
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: searchParams.getAll('category'),
    sizes: searchParams.getAll('size'),
    minRating: Number(searchParams.get('rating')) || 0,
    priceRange: [
      Number(searchParams.get('minPrice')) || 0,
      Number(searchParams.get('maxPrice')) || 10000
    ],
  });

  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    categories: {},
    sizes: {},
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      const formattedProducts = data?.map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        rating: Number(product.rating) || 4.5,
        reviews: product.reviews_count || 0,
        image: product.image_url || woodFrameProduct,
        category: product.category || 'Frames',
        size: product.size || '8x10',
        inStock: (product.stock || 0) > 0,
        isNew: product.featured,
        isBestseller: product.featured,
        isLowStock: (product.stock || 0) > 0 && (product.stock || 0) <= 5,
      })) || [];
      
      setProducts(formattedProducts);
      
      // Calculate filter counts
      const categories: Record<string, number> = {};
      const sizes: Record<string, number> = {};
      
      formattedProducts.forEach(product => {
        categories[product.category] = (categories[product.category] || 0) + 1;
        if (product.size) {
          sizes[product.size] = (sizes[product.size] || 0) + 1;
        }
      });
      
      setFilterCounts({ categories, sizes });
    }
    setLoading(false);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter(p => filters.sizes.includes(p.size));
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter(p => p.rating >= filters.minRating);
    }

    // Price filter
    result = result.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Already sorted by created_at desc
        break;
      default:
        // Featured - prioritize featured items
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [products, filters, sortBy]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    filters.categories.forEach(c => params.append('category', c));
    filters.sizes.forEach(s => params.append('size', s));
    if (filters.minRating > 0) params.set('rating', String(filters.minRating));
    if (filters.priceRange[0] > 0) params.set('minPrice', String(filters.priceRange[0]));
    if (filters.priceRange[1] < 10000) params.set('maxPrice', String(filters.priceRange[1]));
    if (sortBy !== 'featured') params.set('sort', sortBy);
    
    setSearchParams(params, { replace: true });
  }, [filters, sortBy]);

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleSize = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      sizes: [],
      minRating: 0,
      priceRange: [0, 10000],
    });
    setSortBy('featured');
  };

  const activeFilterCount = 
    filters.categories.length + 
    filters.sizes.length + 
    (filters.minRating > 0 ? 1 : 0) + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Active Filters</h4>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-primary">
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.categories.map(cat => (
              <Badge key={cat} variant="secondary" className="gap-1">
                {cat}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
              </Badge>
            ))}
            {filters.sizes.map(size => (
              <Badge key={size} variant="secondary" className="gap-1">
                {size}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSize(size)} />
              </Badge>
            ))}
            {filters.minRating > 0 && (
              <Badge variant="secondary" className="gap-1">
                {filters.minRating}+ Stars
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))} />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4 pb-6 border-b">
        <h4 className="font-medium">Price Range</h4>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
          max={10000}
          step={100}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{filters.priceRange[0].toLocaleString()}</span>
          <span>₹{filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-3 pb-6 border-b">
        <h4 className="font-medium">Category</h4>
        <div className="space-y-2">
          {Object.entries(filterCounts.categories).map(([category, count]) => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox 
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <span className="text-sm flex-1">{category}</span>
              <span className="text-xs text-muted-foreground">({count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-3 pb-6 border-b">
        <h4 className="font-medium">Size</h4>
        <div className="space-y-2">
          {Object.entries(filterCounts.sizes).map(([size, count]) => (
            <label key={size} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox 
                checked={filters.sizes.includes(size)}
                onCheckedChange={() => toggleSize(size)}
              />
              <span className="text-sm flex-1">{size}</span>
              <span className="text-xs text-muted-foreground">({count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2].map((rating) => (
            <label key={rating} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox 
                checked={filters.minRating === rating}
                onCheckedChange={() => setFilters(prev => ({ 
                  ...prev, 
                  minRating: prev.minRating === rating ? 0 : rating 
                }))}
              />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                    }`}
                  />
                ))}
                <span className="text-sm ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container-wide">
          <nav className="text-sm text-muted-foreground">
            Home › Shop
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:w-64 space-y-6">
            <h3 className="font-serif font-bold text-lg">Filters</h3>
            <FilterContent />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2">All Frames</h1>
                <p className="text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden relative">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products match your filters</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                    showQuickView={true}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
