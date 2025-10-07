import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Wishlist = () => {
  const { items, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await toggleWishlist(productId);
  };

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-16 text-center">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4">Sign in to view your wishlist</h1>
          <p className="text-muted-foreground mb-8">
            Save your favorite frames and access them from any device
          </p>
          <Button size="lg" className="btn-hero" asChild>
            <Link to="/login">
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-16 text-center">
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-16 text-center">
          <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8">
            Start adding frames you love to save them for later
          </p>
          <Button size="lg" className="btn-hero" asChild>
            <Link to="/shop">
              Explore Frames
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container-wide">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>›</span>
            <span className="text-foreground">Wishlist</span>
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        <div className="gallery-grid">
          {items.map((item) => (
            <Card key={item.id} className="product-card overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Remove Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                  onClick={() => handleRemoveFromWishlist(item.product_id)}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="font-serif font-bold text-lg mb-2">{item.product.name}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold">₹{item.product.price.toLocaleString()}</span>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full btn-hero" 
                    onClick={() => handleAddToCart(item.product_id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleRemoveFromWishlist(item.product_id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
