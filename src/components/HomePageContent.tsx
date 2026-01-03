import { useState, useEffect } from "react";
import { ArrowRight, Star, Shield, Truck, RotateCcw, Sparkles, Award, Users, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
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
        .limit(4)
        .order('reviews_count', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const trustBadges = [
    { icon: Shield, text: "Premium Quality", subtext: "Handcrafted materials" },
    { icon: Award, text: "Expert Craftsmanship", subtext: "10+ years experience" },
    { icon: Truck, text: "Free Shipping", subtext: "Orders over ₹3,000" },
    { icon: RotateCcw, text: "Easy Returns", subtext: "30-day guarantee" },
  ];

  const categories = [
    { name: "Wall Frames", image: woodFrameProduct, description: "Gallery worthy" },
    { name: "Tabletop", image: metalFrameProduct, description: "Desk essentials" },
    { name: "Gallery Sets", image: heroImage, description: "Curated collections" },
    { name: "Custom Frames", image: frameBuilderPreview, description: "Design yours" },
  ];

  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "50K+", label: "Frames Crafted" },
    { value: "4.9", label: "Average Rating", icon: Star },
    { value: "100%", label: "Satisfaction" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[85vh] py-12 lg:py-0">
            {/* Hero Content */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="space-y-6">
                <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  New Collection 2026
                </Badge>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-[1.1] text-foreground">
                  Frame Your
                  <span className="block text-primary">Precious Moments</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Discover handcrafted photo frames that transform your cherished memories into stunning works of art. Premium quality, timeless design.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="btn-hero text-base px-8" asChild>
                  <Link to="/shop">
                    Shop Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8" asChild>
                  <Link to="/custom-builder">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Design Your Own
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-background" />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">10,000+</span> happy customers
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative order-1 lg:order-2">
              <div className="relative z-10">
                <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl">
                  <img
                    src={heroImage}
                    alt="Beautiful gallery wall featuring premium Kaiga photo frames in a modern living room"
                    className="w-full h-[400px] lg:h-[600px] object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-background p-4 rounded-xl shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary fill-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Loved by Many</p>
                      <p className="text-sm text-muted-foreground">4.9★ from 2,500+ reviews</p>
                    </div>
                  </div>
                </div>

                {/* Floating Price Tag */}
                <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
                  <p className="text-sm font-bold">Starting ₹999</p>
                </div>
              </div>

              {/* Background Decorations */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-muted/50 border-y border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <badge.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{badge.text}</h3>
                <p className="text-sm text-muted-foreground">{badge.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-background">
        <div className="container-wide">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Categories</Badge>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4 text-foreground">
              Shop by Style
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find the perfect frame to complement your space and showcase your memories
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((category, index) => (
              <Link key={index} to="/shop" className="group">
                <Card className="overflow-hidden border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img 
                      src={category.image} 
                      alt={`${category.name} - ${category.description}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                      <h3 className="font-serif font-bold text-lg lg:text-xl text-white mb-1">{category.name}</h3>
                      <p className="text-sm text-white/80">{category.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl lg:text-5xl font-bold">{stat.value}</span>
                  {stat.icon && <stat.icon className="w-6 h-6 fill-current" />}
                </div>
                <p className="text-primary-foreground/80 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-20 bg-muted/20">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-14">
            <div>
              <Badge variant="outline" className="mb-4">Popular Picks</Badge>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-2 text-foreground">
                Bestselling Frames
              </h2>
              <p className="text-muted-foreground">Our most loved pieces, curated for you</p>
            </div>
            <Button variant="outline" size="lg" asChild>
              <Link to="/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden border-border">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-5">
                    <div className="h-4 bg-muted rounded animate-pulse mb-3" />
                    <div className="h-6 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden">
                      {product.featured && (
                        <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground shadow-md">
                          Bestseller
                        </Badge>
                      )}
                      {product.stock < 10 && product.stock > 0 && (
                        <Badge className="absolute top-3 right-3 z-10" variant="destructive">
                          Only {product.stock} left
                        </Badge>
                      )}
                      <img 
                        src={product.image_url || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </Link>
                  
                  <CardContent className="p-5">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews_count})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product.id);
                        }}
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

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-8 lg:p-16 text-center text-primary-foreground">
            <div className="relative z-10 max-w-3xl mx-auto">
              <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Custom Frame Builder
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-serif font-bold mb-6">
                Create Your Perfect Frame
              </h2>
              <p className="text-lg lg:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                Upload your photo and design a custom frame with real-time preview. Choose materials, sizes, and finishes to match your vision.
              </p>
              <Button size="lg" variant="secondary" className="text-base px-8" asChild>
                <Link to="/custom-builder">
                  Start Designing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-muted/50 border-t border-border">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-4 text-foreground">
              Join Our Community
            </h2>
            <p className="text-muted-foreground mb-8">
              Get exclusive offers, design inspiration, and early access to new collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Button className="btn-hero px-8">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};