import { useState } from "react";
import { Filter, Grid, List, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import woodFrameProduct from "@/assets/wood-frame-product.jpg";
import metalFrameProduct from "@/assets/metal-frame-product.jpg";
import heroImage from "@/assets/hero-gallery-wall.jpg";

const Collections = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCollection, setSelectedCollection] = useState("all");

  const collections = [
    {
      id: "cosmic-minimalist",
      name: "Cosmic Minimalist",
      description: "Clean lines meet cosmic aesthetics",
      image: metalFrameProduct,
      count: 24,
      featured: true
    },
    {
      id: "stellar-classic",
      name: "Stellar Classic",
      description: "Timeless elegance with cosmic touch",
      image: woodFrameProduct,
      count: 18,
      featured: true
    },
    {
      id: "nebula-modern",
      name: "Nebula Modern",
      description: "Contemporary cosmic designs",
      image: heroImage,
      count: 32,
      featured: true
    },
    {
      id: "galaxy-vintage",
      name: "Galaxy Vintage",
      description: "Retro meets cosmic sophistication",
      image: woodFrameProduct,
      count: 15,
      featured: false
    },
    {
      id: "space-luxury",
      name: "Space Luxury",
      description: "Premium cosmic materials",
      image: metalFrameProduct,
      count: 12,
      featured: false
    },
    {
      id: "cosmic-art",
      name: "Cosmic Art",
      description: "Artistic cosmic expressions",
      image: heroImage,
      count: 28,
      featured: false
    }
  ];

  const products = [
    {
      id: 1,
      name: "Void Black Minimalist",
      price: 1299,
      originalPrice: 1599,
      rating: 4.8,
      reviews: 124,
      image: metalFrameProduct,
      category: "Metal",
      size: "8x10",
      collection: "cosmic-minimalist",
      inStock: true,
      isNew: false,
      isBestseller: true
    },
    {
      id: 2,
      name: "Stellar Wood Classic",
      price: 999,
      rating: 4.9,
      reviews: 89,
      image: woodFrameProduct,
      category: "Wood",
      size: "8x10",
      collection: "stellar-classic",
      inStock: true,
      isNew: true,
      isBestseller: false
    },
    {
      id: 3,
      name: "Nebula Carbon Frame",
      price: 2199,
      originalPrice: 2499,
      rating: 5.0,
      reviews: 67,
      image: metalFrameProduct,
      category: "Carbon",
      size: "11x14",
      collection: "nebula-modern",
      inStock: true,
      isNew: false,
      isBestseller: false
    },
    {
      id: 4,
      name: "Galaxy Vintage Oak",
      price: 1799,
      rating: 4.7,
      reviews: 156,
      image: woodFrameProduct,
      category: "Wood",
      size: "16x20",
      collection: "galaxy-vintage",
      inStock: false,
      isNew: false,
      isBestseller: true
    },
    {
      id: 5,
      name: "Cosmic Titanium Luxury",
      price: 3499,
      originalPrice: 3999,
      rating: 4.9,
      reviews: 43,
      image: metalFrameProduct,
      category: "Titanium",
      size: "8x10",
      collection: "space-luxury",
      inStock: true,
      isNew: true,
      isBestseller: false
    },
    {
      id: 6,
      name: "Starfield Art Frame",
      price: 1899,
      rating: 4.8,
      reviews: 91,
      image: heroImage,
      category: "Composite",
      size: "12x16",
      collection: "cosmic-art",
      inStock: true,
      isNew: false,
      isBestseller: false
    }
  ];

  const filteredProducts = selectedCollection === "all" 
    ? products 
    : products.filter(product => product.collection === selectedCollection);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray overflow-hidden">
        {/* Cosmic Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cosmic-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cosmic-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container-wide text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Cosmic Collections
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore our curated cosmic collections, each designed to bring harmony 
            and cosmic beauty to your space
          </p>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Collections</h2>
            <p className="text-muted-foreground">Our most popular cosmic frame collections</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {collections.filter(c => c.featured).map((collection) => (
              <Card 
                key={collection.id} 
                className="overflow-hidden border-cosmic-border hover:shadow-cosmic transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedCollection(collection.id)}
              >
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={collection.image} 
                    alt={collection.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{collection.name}</h3>
                    <Badge variant="outline">{collection.count} items</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{collection.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Collections Grid */}
      <section className="py-16 bg-cosmic-gray/30">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">All Collections</h2>
              <p className="text-muted-foreground">Discover every cosmic frame collection</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 mb-12">
            {collections.map((collection) => (
              <Card 
                key={collection.id}
                className={`overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                  selectedCollection === collection.id 
                    ? 'border-cosmic-black shadow-cosmic' 
                    : 'border-cosmic-border hover:border-cosmic-black/50'
                }`}
                onClick={() => setSelectedCollection(collection.id)}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={collection.image} 
                    alt={collection.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-1">{collection.name}</h3>
                  <p className="text-xs text-muted-foreground">{collection.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              {selectedCollection === "all" 
                ? "All Products" 
                : collections.find(c => c.id === selectedCollection)?.name + " Collection"
              } ({filteredProducts.length})
            </h2>
          </div>

          <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                viewMode={viewMode}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found in this collection.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSelectedCollection("all")}
              >
                View All Products
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Collections;