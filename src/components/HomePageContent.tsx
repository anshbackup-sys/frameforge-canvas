import { useState, useEffect } from "react";
import { ArrowRight, Star, Shield, Truck, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-gallery-wall.jpg";
import woodFrameProduct from "@/assets/wood-frame-product.jpg";
import metalFrameProduct from "@/assets/metal-frame-product.jpg";
import frameBuilderPreview from "@/assets/frame-builder-preview.jpg";

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number | null;
  reviews_count: number;
  image_url: string;
  stock: number;
  featured: boolean;
}

export const HomePageContent = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .limit(3)
        .order('reviews_count', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const trustBadges = [
    { icon: Shield, text: "Premium Materials" },
    { icon: Star, text: "Expert Craftsmanship" },
    { icon: Truck, text: "Fast Shipping" },
    { icon: RotateCcw, text: "100% Money Back" },
  ];

  const categories = [
    { name: "Wall Frames", image: woodFrameProduct, description: "Perfect for any room" },
    { name: "Tabletop Frames", image: metalFrameProduct, description: "Desk & shelf display" },
    { name: "Gallery Sets", image: heroImage, description: "Curated collections" },
    { name: "Custom Frames", image: frameBuilderPreview, description: "Design your own" },
    { name: "Wedding Gifts", image: woodFrameProduct, description: "Special occasions" },
    { name: "Office Frames", image: metalFrameProduct, description: "Professional spaces" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-12">
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-up text-foreground">
                  Transform Memories Into{" "}
                  <span className="text-foreground">Cosmic Masterpieces</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed animate-fade-up" style={{animationDelay: '0.2s'}}>
                  Enter the cosmic realm of premium frames — where memories transcend into stellar art pieces.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="btn-hero" asChild>
                  <Link to="/shop">
                    Shop Frames
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="btn-secondary" asChild>
                  <Link to="/custom-builder">Create Your Frame</Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Free shipping on orders ₹3,000+ • 30-day returns • Secure checkout
              </p>
            </div>

            <div className="relative animate-fade-in-delayed">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={heroImage}
                  alt="Beautiful gallery wall with premium photo frames"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-foreground">1,000+ Happy Customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-muted/50">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="trust-badge justify-center text-center">
                <badge.icon className="h-8 w-8 text-foreground mb-2" />
                <span className="font-medium text-foreground">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-muted/20">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Find the perfect frame for every space and occasion</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <Link to="/shop">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-16">
        <div className="container-wide">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2">Bestselling Frames</h2>
              <p className="text-muted-foreground">Our most loved pieces this month</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/shop">View All Products</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-6 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden">
                      {product.featured && (
                        <Badge className="absolute top-4 left-4 z-10 bg-cosmic-black text-cosmic-white">
                          Bestseller
                        </Badge>
                      )}
                      {product.stock < 10 && product.stock > 0 && (
                        <Badge className="absolute top-4 right-4 z-10" variant="destructive">
                          Only {product.stock} left
                        </Badge>
                      )}
                      <img 
                        src={product.image_url || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  
                  <CardContent className="p-6">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews_count})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
                      <Button 
                        size="sm"
                        onClick={() => addToCart(product.id)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
};
