import { useState, useEffect, useMemo } from "react";
import { Filter, Grid, List, Star, X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  
  // Collapsible states
  const [openSections, setOpenSections] = useState({
    price: true,
    category: true,
    size: true,
    rating: true,
  });
  
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const FilterContent = () => (
    <div className="space-y-1">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="pb-4 mb-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm text-foreground">Active Filters</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters} 
              className="h-auto py-1 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.categories.map(cat => (
              <Badge 
                key={cat} 
                variant="secondary" 
                className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                onClick={() => toggleCategory(cat)}
              >
                {cat}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.sizes.map(size => (
              <Badge 
                key={size} 
                variant="secondary" 
                className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                onClick={() => toggleSize(size)}
              >
                {size}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {filters.minRating > 0 && (
              <Badge 
                variant="secondary" 
                className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
              >
                {filters.minRating}+ Stars
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
              <Badge 
                variant="secondary" 
                className="gap-1 pl-2 pr-1 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
                onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 10000] }))}
              >
                ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Price Range */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b border-border group">
          <h4 className="font-semibold text-sm text-foreground">Price Range</h4>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.price ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 pb-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
            max={10000}
            step={100}
            className="w-full mb-4"
          />
          <div className="flex justify-between items-center">
            <div className="px-3 py-1.5 bg-muted rounded-md text-sm font-medium">
              ₹{filters.priceRange[0].toLocaleString()}
            </div>
            <div className="h-px w-4 bg-border" />
            <div className="px-3 py-1.5 bg-muted rounded-md text-sm font-medium">
              ₹{filters.priceRange[1].toLocaleString()}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Category */}
      <Collapsible open={openSections.category} onOpenChange={() => toggleSection('category')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b border-border group">
          <h4 className="font-semibold text-sm text-foreground">Category</h4>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.category ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4">
          <div className="space-y-2">
            {Object.entries(filterCounts.categories).map(([category, count]) => (
              <label 
                key={category} 
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  filters.categories.includes(category) 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted border border-transparent'
                }`}
              >
                <Checkbox 
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm flex-1 font-medium">{category}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count}</span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Size */}
      <Collapsible open={openSections.size} onOpenChange={() => toggleSection('size')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b border-border group">
          <h4 className="font-semibold text-sm text-foreground">Size</h4>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.size ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filterCounts.sizes).map(([size, count]) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  filters.sizes.includes(size)
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                {size}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b border-border group">
          <h4 className="font-semibold text-sm text-foreground">Minimum Rating</h4>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openSections.rating ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-4">
          <div className="space-y-2">
            {[4, 3, 2].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  minRating: prev.minRating === rating ? 0 : rating 
                }))}
                className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors ${
                  filters.minRating === rating
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted border border-transparent'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">& up</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4 border-b border-border">
        <div className="container-wide">
          <nav className="text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer">Home</span>
            <span className="mx-2">›</span>
            <span className="text-foreground font-medium">Shop</span>
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-5 shadow-sm">
              <h3 className="font-serif font-bold text-lg mb-4 pb-3 border-b border-border">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2 text-foreground">All Frames</h1>
                <p className="text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> of {products.length} products
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden relative border-border">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[320px] overflow-y-auto bg-background">
                    <SheetHeader className="border-b border-border pb-4 mb-4">
                      <SheetTitle className="font-serif">Filters</SheetTitle>
                    </SheetHeader>
                    <FilterContent />
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48 border-border">
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
                <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-muted/30 rounded-xl border border-border">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Filter className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for</p>
                <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" : "space-y-4"}>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
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