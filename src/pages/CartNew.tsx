import { Minus, Plus, X, ShoppingCart, ArrowRight, Shield, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CartNew = () => {
  const { items, loading, updateQuantity, removeFromCart } = useCart();

  const subtotal = items.reduce((sum, item) => 
    sum + (item.product?.price || 0) * item.quantity, 0
  );
  const shipping = subtotal >= 3000 ? 0 : 299;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 px-4">
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Your cart is empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
              </p>
            </div>
            <Button size="lg" asChild>
              <Link to="/shop">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Shopping Cart</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                          src={item.product?.image_url}
                          alt={item.product?.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg mb-1 truncate">
                              {item.product?.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              In Stock: {item.product?.stock || 0} units
                            </p>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-2 -mt-2 -mr-2"
                            aria-label="Remove item"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 rounded-md border border-input hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= (item.product?.stock || 0)}
                              className="h-8 w-8 rounded-md border border-input hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ₹{(item.product?.price || 0).toLocaleString()} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button size="lg" className="btn-hero w-full" asChild>
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
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card className="p-4 bg-muted/30 mt-4">
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
      </main>

      <Footer />
    </div>
  );
};

export default CartNew;
