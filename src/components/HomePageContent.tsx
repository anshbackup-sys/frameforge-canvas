import { useState, useEffect } from "react";
import { ArrowRight, Star, Shield, Truck, RotateCcw, Sparkles, Award, Users, Heart, Play, Quote, ChevronLeft, ChevronRight, Upload, Palette, Package, Check } from "lucide-react";
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
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
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
    { name: "Wall Frames", image: woodFrameProduct, description: "Gallery worthy", count: "120+ styles" },
    { name: "Tabletop", image: metalFrameProduct, description: "Desk essentials", count: "80+ styles" },
    { name: "Gallery Sets", image: heroImage, description: "Curated collections", count: "25+ sets" },
    { name: "Custom Frames", image: frameBuilderPreview, description: "Design yours", count: "Unlimited" },
  ];

  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "50K+", label: "Frames Crafted" },
    { value: "4.9", label: "Average Rating", icon: Star },
    { value: "100%", label: "Satisfaction" },
  ];

  const howItWorks = [
    { step: 1, title: "Choose Your Photo", description: "Upload your favorite memory or artwork", icon: Upload },
    { step: 2, title: "Pick Your Frame", description: "Browse 100+ styles and materials", icon: Palette },
    { step: 3, title: "We Craft It", description: "Handmade with premium materials", icon: Package },
    { step: 4, title: "Delivered Ready", description: "Ready to hang in 5-7 days", icon: Check },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      rating: 5,
      text: "Absolutely stunning quality! The custom frame for my wedding photo exceeded all expectations. The attention to detail is remarkable.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      name: "Rahul Verma",
      location: "Delhi",
      rating: 5,
      text: "Ordered a gallery set for my living room. The frames are beautifully crafted and the customer service was exceptional.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    {
      name: "Ananya Patel",
      location: "Bangalore",
      rating: 5,
      text: "The custom frame builder is so easy to use! I designed the perfect frame for my artwork in minutes. Highly recommend!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
  ];

  const pressLogos = [
    { name: "Vogue India", text: "VOGUE" },
    { name: "AD India", text: "AD" },
    { name: "Elle Decor", text: "ELLE DECOR" },
    { name: "GQ India", text: "GQ" },
    { name: "Femina", text: "FEMINA" },
  ];

  return (
    <>
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center py-12 lg:py-0">
            {/* Hero Content */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="space-y-6">
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium animate-fade-in">
                  <Sparkles className="w-4 h-4 mr-2" />
                  New Collection 2026 — Now Live
                </Badge>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold leading-[1.05] text-foreground animate-fade-in">
                  Frame Your
                  <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                    Precious Moments
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in">
                  Handcrafted frames that transform memories into timeless art. Premium quality. Exceptional design.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in">
                <Button size="lg" className="btn-hero text-lg px-10 py-6 h-auto" asChild>
                  <Link to="/shop">
                    Shop Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 h-auto border-2" asChild>
                  <Link to="/custom-builder">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Design Your Own
                  </Link>
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-6 animate-fade-in">
                <div className="flex -space-x-4">
                  {[
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop",
                  ].map((src, i) => (
                    <img 
                      key={i} 
                      src={src} 
                      alt="Happy customer"
                      className="w-12 h-12 rounded-full border-3 border-background object-cover"
                    />
                  ))}
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold border-3 border-background">
                    +9K
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-2 font-bold text-foreground">4.9</span>
                  </div>
                  <p className="text-muted-foreground">
                    Trusted by <span className="font-semibold text-foreground">10,000+</span> happy customers
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative order-1 lg:order-2 animate-scale-in">
              <div className="relative z-10">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    src={heroImage}
                    alt="Beautiful gallery wall featuring premium Kaiga photo frames in a modern living room"
                    className="w-full h-[450px] lg:h-[650px] object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                
                {/* Floating Badge - Bottom Left */}
                <div className="absolute -bottom-4 -left-4 lg:-bottom-8 lg:-left-8 bg-background p-5 rounded-2xl shadow-xl border border-border animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-primary fill-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground">Loved by Many</p>
                      <p className="text-muted-foreground">4.9★ from 2,500+ reviews</p>
                    </div>
                  </div>
                </div>

                {/* Floating Price Tag - Top Right */}
                <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-xl animate-fade-in">
                  <p className="text-lg font-bold">Starting ₹999</p>
                </div>
              </div>

              {/* Background Decorations */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-primary/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Trust Marquee */}
      <section className="py-6 bg-muted/50 border-y border-border overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...trustBadges, ...trustBadges, ...trustBadges].map((badge, index) => (
            <div key={index} className="flex items-center mx-8 text-muted-foreground">
              <badge.icon className="h-5 w-5 mr-2" />
              <span className="font-medium">{badge.text}</span>
              <span className="mx-3">•</span>
            </div>
          ))}
        </div>
      </section>

      {/* As Featured In */}
      <section className="py-16 bg-background">
        <div className="container-wide">
          <p className="text-center text-muted-foreground mb-8 text-sm uppercase tracking-widest">As Featured In</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {pressLogos.map((logo, index) => (
              <span 
                key={index} 
                className="text-2xl lg:text-3xl font-serif font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default"
              >
                {logo.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-muted/20">
        <div className="container-wide">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">Categories</Badge>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-foreground">
              Shop by Style
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the perfect frame to complement your space and showcase your memories
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {categories.map((category, index) => (
              <Link key={index} to="/shop" className="group">
                <Card className="overflow-hidden border-border hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img 
                      src={category.image} 
                      alt={`${category.name} - ${category.description}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <Badge variant="secondary" className="mb-3 text-xs">{category.count}</Badge>
                      <h3 className="font-serif font-bold text-2xl text-white mb-1">{category.name}</h3>
                      <p className="text-white/80">{category.description}</p>
                    </div>
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">Simple Process</Badge>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-foreground">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Creating your perfect frame is easy with our simple 4-step process
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            
            {howItWorks.map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="relative z-10 w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border-2 border-primary/20">
                  <item.icon className="w-12 h-12 text-primary" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="btn-hero text-lg px-10" asChild>
              <Link to="/custom-builder">
                Start Your Design
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl lg:text-6xl font-bold">{stat.value}</span>
                  {stat.icon && <stat.icon className="w-8 h-8 fill-current" />}
                </div>
                <p className="text-primary-foreground/80 text-lg font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-24 bg-muted/20">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-16">
            <div>
              <Badge variant="outline" className="mb-4 px-4 py-1">Popular Picks</Badge>
              <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-3 text-foreground">
                Bestselling Frames
              </h2>
              <p className="text-xl text-muted-foreground">Our most loved pieces, curated for you</p>
            </div>
            <Button variant="outline" size="lg" className="text-lg" asChild>
              <Link to="/shop">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden border-border">
                  <div className="aspect-[3/4] bg-muted animate-pulse" />
                  <CardContent className="p-5">
                    <div className="h-4 bg-muted rounded animate-pulse mb-3" />
                    <div className="h-6 bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))
            ) : (
              products.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-border hover:border-primary/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <Link to={`/product/${product.id}`}>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {product.featured && (
                        <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground shadow-lg">
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
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Quick Add Button */}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Button 
                          className="w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product.id);
                          }}
                        >
                          Add to Cart
                        </Button>
                      </div>
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
                      <span className="text-2xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container-wide">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">Testimonials</Badge>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6 text-foreground">
              What Our Customers Say
            </h2>
          </div>

          <div className="max-w-4xl mx-auto relative">
            <div className="relative bg-muted/30 rounded-3xl p-8 lg:p-12 border border-border">
              <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/20" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-1 justify-center mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-xl lg:text-2xl text-center text-foreground mb-8 font-medium leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </p>

                <div className="flex items-center justify-center gap-4">
                  <img 
                    src={testimonials[currentTestimonial].image} 
                    alt={testimonials[currentTestimonial].name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-bold text-foreground">{testimonials[currentTestimonial].name}</p>
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 bg-background rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 bg-background rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/20">
        <div className="container-wide">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="p-8 lg:p-16">
                <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Custom Frame Builder
                </Badge>
                <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
                  Create Your Perfect Frame
                </h2>
                <p className="text-xl text-primary-foreground/90 mb-8">
                  Upload your photo and design a custom frame with real-time preview. Choose materials, sizes, and finishes to match your vision.
                </p>
                <ul className="space-y-3 mb-8">
                  {["100+ frame styles to choose from", "Real-time preview", "Free design assistance"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" variant="secondary" className="text-lg px-10" asChild>
                  <Link to="/custom-builder">
                    Start Designing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="hidden lg:block relative h-full min-h-[500px]">
                <img 
                  src={frameBuilderPreview} 
                  alt="Custom frame builder preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4 text-foreground">
              Join 50,000+ Frame Lovers
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Get exclusive offers, design inspiration, and early access to new collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
              />
              <Button size="lg" className="btn-hero px-10 py-4 h-auto text-lg">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePageContent;
