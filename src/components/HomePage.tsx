import { ArrowRight, Star, Shield, Truck, RotateCcw, Check, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-gallery-wall.jpg";
import woodFrameProduct from "@/assets/wood-frame-product.jpg";
import metalFrameProduct from "@/assets/metal-frame-product.jpg";
import frameBuilderPreview from "@/assets/frame-builder-preview.jpg";

const HomePage = () => {
  const { addToCart } = useCart();

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

  const bestSellers = [
    {
      id: 1,
      name: "Classic Oak Frame",
      price: "₹1,299",
      originalPrice: "₹1,599",
      rating: 4.8,
      reviews: 124,
      image: woodFrameProduct,
      badge: "Bestseller",
      isLowStock: false,
    },
    {
      id: 2,
      name: "Modern Metal Frame",
      price: "₹999",
      rating: 4.9,
      reviews: 89,
      image: metalFrameProduct,
      badge: "Trending",
      isLowStock: true,
    },
    {
      id: 3,
      name: "Premium Gallery Frame",
      price: "₹2,199",
      originalPrice: "₹2,499",
      rating: 5.0,
      reviews: 67,
      image: woodFrameProduct,
      badge: "Premium",
      isLowStock: false,
    },
  ];

  const bundles = [
    {
      title: "Gallery Wall Starter Pack",
      description: "5 frames in coordinated sizes",
      originalPrice: "₹6,999",
      bundlePrice: "₹5,599",
      savings: "20%",
      image: heroImage,
    },
    {
      title: "Wedding Memory Collection",
      description: "Perfect for capturing special moments",
      originalPrice: "₹4,999",
      bundlePrice: "₹3,999",
      savings: "20%",
      image: woodFrameProduct,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-pastel-cream/30 to-pastel-purple/20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-12">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-up">
                  Transform Memories Into{" "}
                  <span className="bg-gradient-to-r from-cosmic-black to-cosmic-black/70 bg-clip-text text-transparent">Cosmic Masterpieces</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed animate-fade-up" style={{animationDelay: '0.2s'}}>
                  Enter the cosmic realm of premium frames — where memories transcend into stellar art pieces.
                </p>
              </div>

              {/* CTAs */}
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

              {/* Quick Video Link */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Play className="h-4 w-4" />
                  How it's made (45s)
                </Button>
              </div>

              {/* Trust Line */}
              <p className="text-sm text-muted-foreground">
                Free shipping on orders ₹3,000+ • 30-day returns • Secure checkout
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in-delayed">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={heroImage}
                  alt="Beautiful gallery wall with premium photo frames"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating Trust Badge */}
              <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-xl shadow-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">1,000+ Happy Customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-muted/30">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="trust-badge justify-center text-center">
                <badge.icon className="h-8 w-8 text-primary mb-2" />
                <span className="font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Search / Size Finder */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-4">Find Your Perfect Frame Size</h2>
            <p className="text-muted-foreground mb-8">Enter your photo dimensions and we'll suggest the perfect frames</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Width" 
                  className="w-20 px-3 py-2 border border-border rounded-lg text-center"
                />
                <span className="text-muted-foreground">×</span>
                <input 
                  type="number" 
                  placeholder="Height" 
                  className="w-20 px-3 py-2 border border-border rounded-lg text-center"
                />
                <span className="text-sm text-muted-foreground">inches</span>
              </div>
              <Button className="btn-hero">Find Frames</Button>
            </div>
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

          <div className="gallery-grid">
            {categories.map((category, index) => (
              <Card key={index} className="product-card overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-serif font-bold text-lg mb-1">{category.name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{category.description}</p>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/shop">
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16">
        <div className="container-wide">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-2">Bestsellers</h2>
              <p className="text-muted-foreground">Our most loved frames</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/shop">View All</Link>
            </Button>
          </div>

          <div className="gallery-grid">
            {bestSellers.map((product) => (
              <Card key={product.id} className="product-card overflow-hidden">
                <div className="relative">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <Badge 
                    className="absolute top-3 left-3" 
                    variant={product.badge === "Bestseller" ? "default" : "secondary"}
                  >
                    {product.badge}
                  </Badge>
                  {product.isLowStock && (
                    <Badge variant="destructive" className="absolute top-3 right-3">
                      Low Stock
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                  
                  <h3 className="font-serif font-bold text-lg mb-2">{product.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full btn-hero"
                    onClick={() => addToCart(product.id.toString(), 1)}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Frame Builder Promo */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold mb-4">
                Design Your Perfect Custom Frame
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Upload your photo and see it in real-time with our interactive frame builder. 
                Choose materials, colors, and matting options with instant pricing.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Real-time preview with your photo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Premium materials and finishes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Professional mounting and backing</span>
                </div>
              </div>
              
              <Button size="lg" className="btn-hero" asChild>
                <Link to="/custom-builder">
                  Start Customizing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <img
                src={frameBuilderPreview}
                alt="Custom frame builder interface"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bundles & Offers */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Special Bundles & Offers</h2>
            <p className="text-muted-foreground">Save more with our curated collections</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {bundles.map((bundle, index) => (
              <Card key={index} className="product-card overflow-hidden">
                <div className="relative">
                  <img
                    src={bundle.image}
                    alt={bundle.title}
                    className="w-full h-64 object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    Save {bundle.savings}
                  </Badge>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-serif font-bold text-xl mb-2">{bundle.title}</h3>
                  <p className="text-muted-foreground mb-4">{bundle.description}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold">{bundle.bundlePrice}</span>
                    <span className="text-lg text-muted-foreground line-through">
                      {bundle.originalPrice}
                    </span>
                  </div>
                  
                  <Button className="w-full btn-hero">
                    Add Bundle to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Get 10% Off Your First Order
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Plus styling tips and exclusive offers delivered to your inbox
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-foreground"
            />
            <Button variant="secondary" size="lg">
              Get 10% Off
            </Button>
          </div>
          
          <p className="text-sm text-primary-foreground/60 mt-4">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;