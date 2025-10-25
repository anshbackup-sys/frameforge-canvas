import { useState, useEffect } from "react";
import { ShoppingCart, Star, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface Bundle {
  id: string;
  name: string;
  description: string;
  image_url: string;
  discount_percentage: number;
  featured: boolean;
  products?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  total_price?: number;
  discounted_price?: number;
}

const Bundles = () => {
  const { addToCart } = useCart();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const { data: bundlesData, error } = await supabase
        .from('bundles')
        .select(`
          *,
          bundle_products(
            quantity,
            product:products(
              id,
              name,
              price
            )
          )
        `)
        .order('featured', { ascending: false });

      if (error) throw error;

      const bundlesWithCalculations = (bundlesData || []).map(bundle => {
        const products = bundle.bundle_products?.map((bp: any) => bp.product).filter(Boolean) || [];
        const total_price = products.reduce((sum: number, p: any) => sum + (p.price || 0), 0);
        const discounted_price = total_price * (1 - (bundle.discount_percentage || 0) / 100);

        return {
          ...bundle,
          products,
          total_price,
          discounted_price
        };
      });

      setBundles(bundlesWithCalculations);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (bundle: Bundle) => {
    if (!bundle.products || bundle.products.length === 0) {
      toast.error('This bundle has no products');
      return;
    }

    try {
      for (const product of bundle.products) {
        await addToCart(product.id, 1);
      }
      toast.success(`Added ${bundle.name} to cart`);
    } catch (error) {
      console.error('Error adding bundle to cart:', error);
    }
  };

  const featuredBundles = bundles.filter(b => b.featured);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-cosmic-black via-background to-cosmic-gray overflow-hidden">
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
            {loading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border-cosmic-border">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="h-80 bg-cosmic-gray/50 animate-pulse" />
                    <CardContent className="p-12">
                      <div className="space-y-4">
                        <div className="h-8 bg-cosmic-gray/50 rounded animate-pulse" />
                        <div className="h-4 bg-cosmic-gray/50 rounded animate-pulse" />
                        <div className="h-16 bg-cosmic-gray/50 rounded animate-pulse" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            ) : featuredBundles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No featured bundles available</p>
              </div>
            ) : (
              featuredBundles.map((bundle, index) => (
                <Card key={bundle.id} className="overflow-hidden border-cosmic-border hover:shadow-cosmic transition-all duration-300">
                  <div className={`grid lg:grid-cols-2 gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    <div className={`relative ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                      <img 
                        src={bundle.image_url || '/placeholder.svg'} 
                        alt={bundle.name}
                        className="w-full h-80 lg:h-full object-cover"
                      />
                      {bundle.featured && (
                        <Badge className="absolute top-4 left-4 bg-cosmic-black text-cosmic-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-3xl font-bold mb-3">{bundle.name}</h3>
                          <p className="text-muted-foreground text-lg">{bundle.description}</p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Includes {bundle.products?.length || 0} products
                          </p>
                          {bundle.products && bundle.products.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {bundle.products.map((product) => (
                                <Badge key={product.id} variant="outline" className="text-xs">
                                  {product.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <span className="text-4xl font-bold">
                              ₹{Math.round(bundle.discounted_price || 0).toLocaleString()}
                            </span>
                            {bundle.total_price && bundle.total_price > 0 && (
                              <>
                                <span className="text-xl text-muted-foreground line-through">
                                  ₹{Math.round(bundle.total_price).toLocaleString()}
                                </span>
                                <Badge className="bg-primary text-primary-foreground">
                                  Save {bundle.discount_percentage}%
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          <Button 
                            size="lg" 
                            className="w-full lg:w-auto"
                            onClick={() => handleAddToCart(bundle)}
                          >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add Bundle to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* All Bundles */}
      <section className="py-16 bg-cosmic-gray/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">All Bundles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse all available bundle collections
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-cosmic-gray/50 animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-cosmic-gray/50 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-cosmic-gray/50 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : bundles.filter(b => !b.featured).length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No other bundles available</p>
              </div>
            ) : (
              bundles.filter(b => !b.featured).map((bundle) => (
                <Card key={bundle.id} className="overflow-hidden border-cosmic-border hover:shadow-cosmic transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={bundle.image_url || '/placeholder.svg'} 
                      alt={bundle.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{bundle.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{bundle.description}</p>
                    
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {bundle.products?.length || 0} products included
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">
                          ₹{Math.round(bundle.discounted_price || 0).toLocaleString()}
                        </span>
                        {bundle.total_price && bundle.total_price > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{Math.round(bundle.total_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleAddToCart(bundle)}
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
