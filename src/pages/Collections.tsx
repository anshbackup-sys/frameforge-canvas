import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Collection {
  id: string;
  name: string;
  description: string;
  image_url: string;
  featured: boolean;
  product_count?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number | null;
  reviews_count: number;
  image_url: string;
  category: string;
  size: string;
  collection_id: string | null;
  stock: number;
  featured: boolean;
}

const Collections = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
    fetchProducts();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('featured', { ascending: false });

      if (error) throw error;

      // Get product counts for each collection
      const collectionsWithCounts = await Promise.all(
        (data || []).map(async (collection) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);
          
          return { ...collection, product_count: count || 0 };
        })
      );

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCollection === "all" 
    ? products 
    : products.filter(product => product.collection_id === selectedCollection);

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
            {loading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-cosmic-gray/50 animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-cosmic-gray/50 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-cosmic-gray/50 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              collections.filter(c => c.featured).map((collection) => (
                <Card 
                  key={collection.id} 
                  className="overflow-hidden border-cosmic-border hover:shadow-cosmic transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <Link to={`/collection/${collection.id}`}>
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={collection.image_url || '/placeholder.svg'} 
                        alt={collection.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{collection.name}</h3>
                        <Badge variant="outline">{collection.product_count || 0} items</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{collection.description}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))
            )}
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
                    src={collection.image_url || '/placeholder.svg'} 
                    alt={collection.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-1">{collection.name}</h3>
                  <p className="text-xs text-muted-foreground">{collection.product_count || 0} items</p>
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
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-cosmic-gray/50 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-cosmic-gray/50 rounded animate-pulse mb-2" />
                    <div className="h-6 bg-cosmic-gray/50 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    rating: product.rating || 0,
                    reviews: product.reviews_count,
                    image: product.image_url,
                    category: product.category,
                    size: product.size,
                    inStock: product.stock > 0,
                    isBestseller: product.featured
                  }} 
                  viewMode={viewMode}
                />
              ))
            )}
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