import { useState } from "react";
import { ArrowLeft, Heart, Share2, Star, Shield, Truck, RotateCcw, ShoppingCart, Plus, Minus, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import woodFrameProduct from "@/assets/wood-frame-product.jpg";
import metalFrameProduct from "@/assets/metal-frame-product.jpg";

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("8x10");
  const [selectedFinish, setSelectedFinish] = useState("natural");
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: 1,
    name: "Classic Oak Frame",
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviews: 124,
    sku: "CF-OAK-001",
    inStock: true,
    lowStock: 3,
    images: [woodFrameProduct, metalFrameProduct, woodFrameProduct],
    description: "Handcrafted from premium oak wood, this classic frame brings warmth and elegance to any space. Perfect for family photos, artwork, or professional displays.",
    features: [
      "Premium oak construction",
      "Acid-free matting included", 
      "UV-protective glass",
      "Easy-hanging hardware included",
      "Handcrafted finish"
    ],
    dimensions: {
      "5x7": { outer: "7x9", price: 999 },
      "8x10": { outer: "10x12", price: 1299 },
      "11x14": { outer: "13x16", price: 1699 },
      "16x20": { outer: "18x22", price: 2199 }
    },
    finishes: ["natural", "dark-walnut", "white-wash"],
    materials: "Solid oak wood, acid-free mat, UV-protective glass"
  };

  const relatedProducts = [
    {
      id: 2,
      name: "Modern Metal Frame",
      price: 999,
      rating: 4.9,
      reviews: 89,
      image: metalFrameProduct,
      category: "Metal",
      size: "8x10",
      inStock: true,
      isNew: true
    },
    {
      id: 3,
      name: "Premium Gallery Frame",
      price: 2199,
      originalPrice: 2499,
      rating: 5.0,
      reviews: 67,
      image: woodFrameProduct,
      category: "Wood",
      size: "8x10",
      inStock: true,
      isBestseller: true
    }
  ];

  const bundleProducts = [
    {
      name: "Matching Tabletop Frame",
      price: 799,
      originalPrice: 999,
      image: metalFrameProduct
    },
    {
      name: "Professional Hanging Kit",
      price: 299,
      originalPrice: 399,
      image: woodFrameProduct
    }
  ];

  const currentPrice = product.dimensions[selectedSize as keyof typeof product.dimensions].price;
  const savings = product.originalPrice ? product.originalPrice - currentPrice : 0;

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-4">
        <div className="container-wide">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>›</span>
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <span>›</span>
            <span className="text-foreground">Classic Oak Frame</span>
          </nav>
        </div>
      </div>

      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
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

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-serif font-bold">{product.name}</h1>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
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
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">₹{currentPrice.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {savings > 0 && (
                  <Badge className="bg-primary text-primary-foreground">
                    Save ₹{savings.toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Variants */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(product.dimensions).map(([size, details]) => (
                      <SelectItem key={size} value={size}>
                        {size}" (Outer: {details.outer}") - ₹{details.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Finish</label>
                <div className="grid grid-cols-3 gap-2">
                  {product.finishes.map((finish) => (
                    <Button
                      key={finish}
                      variant={selectedFinish === finish ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFinish(finish)}
                      className="text-center"
                    >
                      {finish.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
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
                {product.lowStock && product.lowStock <= 5 && (
                  <Badge variant="destructive">Only {product.lowStock} left!</Badge>
                )}
              </div>

              <div className="space-y-3">
                <Button size="lg" className="btn-hero w-full">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - ₹{(currentPrice * quantity).toLocaleString()}
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
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

        {/* Bundle Offers */}
        <div className="mt-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Frequently Bought Together</h2>
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-4">
                <img src={product.images[0]} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                <span className="text-2xl text-muted-foreground">+</span>
                {bundleProducts.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    {index < bundleProducts.length - 1 && <span className="text-2xl text-muted-foreground">+</span>}
                  </div>
                ))}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Bundle Price:</p>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ₹{(currentPrice + bundleProducts.reduce((sum, item) => sum + item.price, 0)).toLocaleString()}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{(product.originalPrice! + bundleProducts.reduce((sum, item) => sum + item.originalPrice, 0)).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-primary font-medium">Save ₹598 (20%)</p>
                </div>
                <Button className="btn-hero w-full">
                  Add Bundle to Cart
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
              <TabsTrigger value="care">Care Instructions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6">
              <div className="space-y-4">
                <p className="leading-relaxed">{product.description}</p>
                <h3 className="font-serif font-bold text-lg">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="specs" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Materials</h4>
                    <p className="text-sm text-muted-foreground">{product.materials}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Available Sizes</h4>
                    <div className="space-y-1">
                      {Object.entries(product.dimensions).map(([size, details]) => (
                        <p key={size} className="text-sm text-muted-foreground">
                          {size}" (Outer: {details.outer}")
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{product.rating}</div>
                    <div className="flex items-center gap-1 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{product.reviews} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-8 text-sm">{stars}★</span>
                        <div className="flex-1 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-yellow-400 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-sm text-muted-foreground">{Math.floor(Math.random() * 50)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium">Customer {i}</span>
                        <span className="text-sm text-muted-foreground">• 2 weeks ago</span>
                      </div>
                      <p className="text-sm">Beautiful frame, excellent quality. Exactly as described and arrived quickly.</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="care" className="mt-6">
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-lg">Care Instructions</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Clean frame with a soft, dry cloth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Avoid direct sunlight to prevent fading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Use appropriate wall anchors for hanging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <span>Handle glass carefully during installation</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif font-bold mb-6">You Might Also Like</h2>
          <div className="gallery-grid">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;