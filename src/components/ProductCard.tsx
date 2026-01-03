import { Star, Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
}

const ProductCard = ({ product, viewMode = "grid" }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id.toString());

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id.toString(), 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id.toString());
  };

  return (
    <Card className="product-card overflow-hidden group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <Link to={`/product/${product.id}`} className={`block ${viewMode === "list" ? "flex gap-4" : ""}`}>
        <div className={`relative overflow-hidden ${viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "aspect-square"}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-primary text-primary-foreground shadow-md">New</Badge>
            )}
            {product.isBestseller && (
              <Badge variant="secondary" className="shadow-md">Bestseller</Badge>
            )}
            {product.isLowStock && (
              <Badge variant="destructive" className="shadow-md">Low Stock</Badge>
            )}
            {!product.inStock && (
              <Badge variant="destructive" className="shadow-md">Out of Stock</Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-accent text-accent-foreground shadow-md">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background shadow-md transition-transform duration-200 hover:scale-110"
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          {/* Quick Add Button - visible on hover */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <Button 
              className="w-full btn-hero shadow-lg" 
              size="sm"
              disabled={!product.inStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>

        <CardContent className={`${viewMode === "list" ? "flex-1 p-4 flex flex-col justify-center" : "p-4"}`}>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({product.reviews})
            </span>
          </div>

          {/* Product Info */}
          <h3 className="font-serif font-bold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {product.category} • {product.size}
          </p>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;