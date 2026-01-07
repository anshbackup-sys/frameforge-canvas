import { useState, useEffect } from "react";
import { Heart, Share2, Star, Shield, Truck, RotateCcw, ShoppingCart, Plus, Minus, Zap } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number | null;
  reviews_count: number;
  image_url: string;
  images: string[];
  description: string;
  category: string;
  material: string;
  size: string;
  finish: string;
  stock: number;
  featured: boolean;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  verified_purchase: boolean | null;
  user_id: string;
  profiles?: {
    full_name: string | null;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [id]);

  useEffect(() => {
    if (id && user) {
      checkCanReview();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      const productData = {
        ...data,
        images: data.images || [data.image_url, data.image_url, data.image_url]
      };
      
      setProduct(productData);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('id', id)
        .limit(4);

      if (error) throw error;
      setRelatedProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };
  // Reviews are fetched by ReviewList component directly

  const checkCanReview = async () => {
    if (!user || !id) return;
    
    try {
      // Check if user has purchased this product
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select(`
          id,
          order:order_id (user_id, status)
        `)
        .eq('product_id', id);

      if (orderError) throw orderError;

      const hasPurchased = orderItems?.some(
        item => item.order && (item.order as any).user_id === user.id && (item.order as any).status === 'delivered'
      );
      
      setCanReview(hasPurchased || false);
      
      // Check if user has already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', id)
        .eq('user_id', user.id)
        .single();
      
      setHasReviewed(!!existingReview);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  const handleToggleWishlist = () => {
    if (product) {
      toggleWishlist(product.id);
    }
  };

  // handleReviewSubmitted is now handled inline with onSuccess callback

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted rounded-xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-24 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="bg-muted/30 py-4">
        <div className="container-wide">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>›</span>
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <span>›</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-serif font-bold">{product.name}</h1>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleToggleWishlist}
                  className={isInWishlist(product.id) ? "text-red-500" : ""}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm text-muted-foreground">
                    {product.rating || 0} ({product.reviews_count} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Material:</span>
                <span className="font-medium">{product.material}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{product.size}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Finish:</span>
                <span className="font-medium">{product.finish}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="destructive">Only {product.stock} left!</Badge>
                )}
                {product.stock === 0 && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="btn-hero w-full"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : `Add to Cart - ₹${(product.price * quantity).toLocaleString()}`}
                </Button>
                <Button size="lg" variant="outline" className="w-full" disabled={product.stock === 0}>
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
              <div className="text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">30-Day Returns</p>
              </div>
              <div className="text-center">
                <Truck className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">100% Guarantee</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <p className="leading-relaxed">{product.description}</p>
            </TabsContent>
            
            <TabsContent value="specs" className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Material</h4>
                  <p className="text-sm text-muted-foreground">{product.material}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Size</h4>
                  <p className="text-sm text-muted-foreground">{product.size}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Finish</h4>
                  <p className="text-sm text-muted-foreground">{product.finish}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6 space-y-8">
              {/* Review Form */}
              {user && canReview && !hasReviewed && !showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              )}
              
              {user && canReview && !hasReviewed && showReviewForm && (
                <ReviewForm 
                  productId={product.id} 
                  onSuccess={() => {
                    setShowReviewForm(false);
                    setHasReviewed(true);
                    setReviewRefreshKey(k => k + 1);
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}
              
              {user && hasReviewed && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center text-muted-foreground">
                    You have already reviewed this product.
                  </CardContent>
                </Card>
              )}
              
              {user && !canReview && !hasReviewed && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center text-muted-foreground">
                    Purchase this product to leave a review.
                  </CardContent>
                </Card>
              )}
              
              {!user && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4 text-center text-muted-foreground">
                    <Link to="/login" className="text-primary hover:underline">Sign in</Link> to leave a review.
                  </CardContent>
                </Card>
              )}
              
              {/* Review List */}
              <ReviewList productId={product.id} refreshKey={reviewRefreshKey} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Related Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard 
                key={relatedProduct.id} 
                product={{
                  id: relatedProduct.id,
                  name: relatedProduct.name,
                  price: relatedProduct.price,
                  rating: relatedProduct.rating || 0,
                  reviews: relatedProduct.reviews_count,
                  image: relatedProduct.image_url,
                  category: relatedProduct.category,
                  size: relatedProduct.size,
                  inStock: relatedProduct.stock > 0
                }} 
                viewMode="grid" 
              />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;