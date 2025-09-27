import { useState } from "react";
import { Filter, Grid, List, Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import woodFrameProduct from "@/assets/wood-frame-product.jpg";
import metalFrameProduct from "@/assets/metal-frame-product.jpg";

const Shop = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 5000]);

  const products = [
    {
      id: 1,
      name: "Classic Oak Frame",
      price: 1299,
      originalPrice: 1599,
      rating: 4.8,
      reviews: 124,
      image: woodFrameProduct,
      category: "Wood",
      size: "8x10",
      inStock: true,
      isNew: false,
      isBestseller: true,
    },
    {
      id: 2,
      name: "Modern Metal Frame",
      price: 999,
      rating: 4.9,
      reviews: 89,
      image: metalFrameProduct,
      category: "Metal",
      size: "11x14",
      inStock: true,
      isNew: true,
      isBestseller: false,
    },
    {
      id: 3,
      name: "Premium Gallery Frame",
      price: 2199,
      originalPrice: 2499,
      rating: 5.0,
      reviews: 67,
      image: woodFrameProduct,
      category: "Wood",
      size: "16x20",
      inStock: true,
      isNew: false,
      isBestseller: false,
    },
    {
      id: 4,
      name: "Minimalist Black Frame",
      price: 799,
      rating: 4.7,
      reviews: 156,
      image: metalFrameProduct,
      category: "Metal",
      size: "5x7",
      inStock: false,
      isNew: false,
      isBestseller: true,
    },
  ];

  const filteredProducts = products.filter(
    (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
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
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <div>
              <h3 className="font-serif font-bold text-lg mb-4">Filters</h3>
              
              {/* Price Range */}
              <div className="space-y-4 pb-6 border-b">
                <h4 className="font-medium">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={5000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-medium">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">Wood Frames (24)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">Metal Frames (18)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">Acrylic Frames (12)</span>
                  </label>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-3 pb-6 border-b">
                <h4 className="font-medium">Size</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">5x7 (15)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">8x10 (28)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">11x14 (22)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">16x20 (18)</span>
                  </label>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <h4 className="font-medium">Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center space-x-2">
                      <Checkbox />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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

              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select defaultValue="featured">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex border rounded-lg">
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
            <div className={viewMode === "grid" ? "gallery-grid" : "space-y-4"}>
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                  showQuickView={true}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;