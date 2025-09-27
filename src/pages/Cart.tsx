import { useState } from "react";
import { Minus, Plus, X, ShoppingCart, ArrowRight, Shield, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import woodFrameProduct from "@/assets/wood-frame-product.jpg";
import metalFrameProduct from "@/assets/metal-frame-product.jpg";

interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  finish: string;
  quantity: number;
  inStock: boolean;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Classic Oak Frame",
      price: 1299,
      originalPrice: 1599,
      image: woodFrameProduct,
      size: "8x10",
      finish: "Natural",
      quantity: 2,
      inStock: true,
    },
    {
      id: 2,
      name: "Modern Metal Frame",
      price: 999,
      image: metalFrameProduct,
      size: "11x14",
      finish: "Black",
      quantity: 1,
      inStock: true,
    },
  ]);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setAppliedPromo("WELCOME10");
      setPromoCode("");
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = cartItems.reduce((sum, item) => 
    sum + ((item.originalPrice || item.price) - item.price) * item.quantity, 0
  );
  const promoDiscount = appliedPromo ? Math.floor(subtotal * 0.1) : 0;
  const shipping = subtotal >= 3000 ? 0 : 299;
  const total = subtotal - promoDiscount + shipping;

  const recommendedProducts = [
    {
      id: 5,
      name: "Professional Hanging Kit",
      price: 299,
      originalPrice: 399,
      image: woodFrameProduct,
      description: "Complete installation solution"
    },
    {
      id: 6,
      name: "Premium Gift Wrapping",
      price: 199,
      image: metalFrameProduct,
      description: "Elegant presentation"
    }
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container-wide py-16 text-center">
          <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Discover our beautiful frames and start creating your perfect display
          </p>
          <Button size="lg" className="btn-hero" asChild>
            <Link to="/shop">
              Start Shopping
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
            <span className="text-foreground">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-serif font-bold">Shopping Cart</h1>
              <p className="text-muted-foreground">{cartItems.length} items</p>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-lg">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.size} • {item.finish}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold">₹{item.price.toLocaleString()}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 py-2 min-w-[3rem] text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                          {item.originalPrice && (
                            <p className="text-sm text-muted-foreground">
                              Save ₹{((item.originalPrice - item.price) * item.quantity).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recommended Add-ons */}
            <div className="mt-8">
              <h2 className="text-xl font-serif font-bold mb-4">Complete your order</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendedProducts.map((product) => (
                  <Card key={product.id} className="p-4 border-dashed hover:border-solid transition-all">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-serif font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Savings</span>
                    <span>-₹{savings.toLocaleString()}</span>
                  </div>
                )}
                
                {appliedPromo && (
                  <div className="flex justify-between text-primary">
                    <span>Promo ({appliedPromo})</span>
                    <span>-₹{promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button onClick={applyPromoCode} variant="outline">
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Badge variant="secondary">{appliedPromo}</Badge>
                    <span>10% discount applied!</span>
                  </div>
                )}
              </div>

              <Button size="lg" className="btn-hero w-full mt-6" asChild>
                <Link to="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout • SSL encrypted</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Gift className="h-4 w-4" />
                  <span>Free gift wrapping available</span>
                </div>
              </div>
            </Card>

            {/* Shipping Info */}
            <Card className="p-4 bg-muted/30">
              <div className="text-sm space-y-2">
                <p className="font-medium">Shipping Information</p>
                <p className="text-muted-foreground">
                  {shipping === 0 
                    ? "🎉 You qualify for free shipping!" 
                    : `Add ₹${(3000 - subtotal).toLocaleString()} more for free shipping`
                  }
                </p>
                <p className="text-muted-foreground">
                  Estimated delivery: 3-5 business days
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;