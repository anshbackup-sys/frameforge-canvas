import { ShoppingCart, Star, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-gallery-wall.jpg";
import woodFrameProduct from "@/assets/wood-frame-product.jpg";
import metalFrameProduct from "@/assets/metal-frame-product.jpg";

const Bundles = () => {
  const featuredBundles = [
    {
      id: 1,
      title: "Cosmic Gallery Wall",
      subtitle: "Complete cosmic collection",
      description: "Transform your space with this curated set of 7 cosmic frames in varying sizes",
      image: heroImage,
      originalPrice: 8999,
      bundlePrice: 6999,
      savings: 22,
      popular: true,
      frames: ["8x10", "5x7", "11x14", "4x6", "16x20", "8x10", "5x7"],
      rating: 4.9,
      reviews: 156
    },
    {
      id: 2,
      title: "Starfield Trio",
      subtitle: "Perfect harmony set",
      description: "Three perfectly matched cosmic frames for a cohesive display",
      image: woodFrameProduct,
      originalPrice: 4499,
      bundlePrice: 3599,
      savings: 20,
      popular: false,
      frames: ["8x10", "8x10", "8x10"],
      rating: 4.8,
      reviews: 89
    },
    {
      id: 3,
      title: "Cosmic Memories Bundle",
      subtitle: "Wedding & special occasions",
      description: "Elegant collection designed for your most precious memories",
      image: metalFrameProduct,
      originalPrice: 6999,
      bundlePrice: 5599,
      savings: 20,
      popular: false,
      frames: ["16x20", "11x14", "8x10", "5x7"],
      rating: 5.0,
      reviews: 67
    }
  ];

  const occasionBundles = [
    {
      title: "Newborn Collection",
      description: "Celebrate new arrivals with gentle cosmic frames",
      price: 2999,
      originalPrice: 3799,
      image: woodFrameProduct,
      frames: 4
    },
    {
      title: "Anniversary Special",
      description: "Mark milestones with our romantic cosmic collection",
      price: 4499,
      originalPrice: 5599,
      image: metalFrameProduct,
      frames: 5
    },
    {
      title: "Graduation Pride",
      description: "Showcase achievements with professional cosmic frames",
      price: 3499,
      originalPrice: 4299,
      image: heroImage,
      frames: 3
    },
    {
      title: "Family Heritage",
      description: "Multi-generation display with varied cosmic sizes",
      price: 7999,
      originalPrice: 9999,
      image: woodFrameProduct,
      frames: 8
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray overflow-hidden">
        {/* Cosmic Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cosmic-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cosmic-white/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cosmic-white/15 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
        
        <div className="container-wide text-center relative z-10">
          <Badge className="mb-6 bg-cosmic-black text-cosmic-white border-cosmic-border">
            <Sparkles className="h-4 w-4 mr-1" />
            Cosmic Collections
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Cosmic Frame Bundles
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Curated collections that bring cosmic harmony to your spaces. 
            Save more while creating stunning gallery walls with our premium bundle sets.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span>Save up to 25%</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Curated by experts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bundles */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Cosmic Collections</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our most popular bundle sets, designed to create stunning cosmic displays
            </p>
          </div>

          <div className="space-y-8">
            {featuredBundles.map((bundle, index) => (
              <Card key={bundle.id} className="overflow-hidden border-cosmic-border hover:shadow-cosmic transition-all duration-300">
                <div className={`grid lg:grid-cols-2 gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <img 
                      src={bundle.image} 
                      alt={bundle.title}
                      className="w-full h-80 lg:h-full object-cover"
                    />
                    {bundle.popular && (
                      <Badge className="absolute top-4 left-4 bg-cosmic-black text-cosmic-white">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="space-y-6">
                      <div>
                        <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">
                          {bundle.subtitle}
                        </p>
                        <h3 className="text-3xl font-bold mb-3">{bundle.title}</h3>
                        <p className="text-muted-foreground text-lg">{bundle.description}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(bundle.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {bundle.rating} ({bundle.reviews} reviews)
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Includes {bundle.frames.length} frames:</p>
                        <div className="flex flex-wrap gap-2">
                          {bundle.frames.map((size, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {size}"
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-bold">₹{bundle.bundlePrice.toLocaleString()}</span>
                          <span className="text-xl text-muted-foreground line-through">
                            ₹{bundle.originalPrice.toLocaleString()}
                          </span>
                          <Badge className="bg-primary text-primary-foreground">
                            Save {bundle.savings}%
                          </Badge>
                        </div>
                        
                        <Button size="lg" className="w-full lg:w-auto">
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Add Bundle to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Occasion Bundles */}
      <section className="py-16 bg-cosmic-gray/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Occasion Collections</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Specially curated bundles for life's most important moments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {occasionBundles.map((bundle, index) => (
              <Card key={index} className="overflow-hidden border-cosmic-border hover:shadow-cosmic transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={bundle.image} 
                    alt={bundle.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2">{bundle.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{bundle.description}</p>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      {bundle.frames} frames included
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">₹{bundle.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{bundle.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    
                    <Button size="sm" className="w-full">
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Cosmic Bundles?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cosmic-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-cosmic-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Maximum Savings</h3>
              <p className="text-muted-foreground">Save up to 25% compared to buying individual frames</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cosmic-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-cosmic-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Expert Curation</h3>
              <p className="text-muted-foreground">Each bundle is carefully designed by our cosmic design experts</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-cosmic-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-cosmic-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Perfect Harmony</h3>
              <p className="text-muted-foreground">Guaranteed cosmic coordination for stunning gallery walls</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Bundles;