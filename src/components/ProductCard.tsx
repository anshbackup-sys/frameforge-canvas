import { useState } from "react";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface ProductCardProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    category: string;
    size: string;
    inStock: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
    isLowStock?: boolean;
  };
  viewMode?: "grid" | "list";
  showQuickView?: boolean;
}

const ProductCard = ({ product, viewMode = "grid", showQuickView = true }: ProductCardProps) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id.toString());

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="product-card overflow-hidden group">
      <div className={`relative ${viewMode === "list" ? "flex gap-4" : ""}`}>
        <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "aspect-square"}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay on hover with quick actions */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            {showQuickView && (
              <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Eye className="h-4 w-4 mr-1" />
                    Quick View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="aspect-square">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-serif font-bold">{product.name}</h2>
                        <p className="text-muted-foreground">{product.category} • {product.size}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                            <Badge variant="destructive" className="ml-2">
                              {discount}% OFF
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button 
                          className="btn-hero w-full" 
                          disabled={!product.inStock}
                          onClick={() => addToCart(product.id.toString(), 1)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                        <Button variant="outline" className="w-full">
                          View Full Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && <Badge>New</Badge>}
            {product.isBestseller && <Badge variant="secondary">Bestseller</Badge>}
            {product.isLowStock && <Badge variant="destructive">Low Stock</Badge>}
            {!product.inStock && <Badge variant="destructive">Out of Stock</Badge>}
            {discount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
            onClick={() => toggleWishlist(product.id.toString())}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        <CardContent className={`${viewMode === "list" ? "flex-1 p-4" : "p-4"}`}>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">
              {product.rating} ({product.reviews})
            </span>
          </div>

          {/* Product Info */}
          <h3 className="font-serif font-bold text-lg mb-1 hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {product.category} • {product.size}
          </p>

          {/* Price */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className={`${viewMode === "list" ? "flex gap-2" : "space-y-2"}`}>
            <Button 
              className="btn-hero flex-1" 
              disabled={!product.inStock}
              onClick={() => addToCart(product.id.toString(), 1)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            {viewMode === "list" && showQuickView && (
              <Button variant="outline" onClick={() => setIsQuickViewOpen(true)}>
                Quick View
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default ProductCard;