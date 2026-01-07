import { useState, useEffect, useRef } from "react";
import { Search, User, Heart, ShoppingCart, Menu, X, LogOut, Package, Palette } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
}

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSuggestions = async (query: string) => {
    const { data } = await supabase
      .from("products")
      .select("id, name, category, price, image_url")
      .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(5);
    setSuggestions(data || []);
    setShowSuggestions(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navigation = [
    { name: "Shop", href: "/shop" },
    { name: "Custom Builder", href: "/custom-builder" },
    { name: "Collections", href: "/collections" },
    { name: "Bundles", href: "/bundles" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      {/* Promo Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm">
        <p>✨ 15% Off First Order • Free shipping over ₹3,000 • 30-day returns</p>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cosmic-black rounded-lg flex items-center justify-center">
                <span className="text-cosmic-white font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-xl text-foreground">Kaiga</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search frames, sizes or styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  className="pl-10 bg-muted/50 border-muted"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
                    {suggestions.map((s) => (
                      <Link
                        key={s.id}
                        to={`/product/${s.id}`}
                        onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                      >
                        <img src={s.image_url} alt={s.name} className="w-10 h-10 object-cover rounded" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.category}</p>
                        </div>
                        <span className="text-sm font-semibold">₹{s.price.toLocaleString()}</span>
                      </Link>
                    ))}
                    <Link
                      to={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => { setShowSuggestions(false); setSearchQuery(""); }}
                      className="block p-3 text-center text-sm text-primary hover:bg-muted border-t"
                    >
                      See all results for "{searchQuery}"
                    </Link>
                  </div>
                )}
              </form>
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/wishlist">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                  <span className="sr-only">Wishlist</span>
                </Link>
              </Button>

              {/* User Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/saved-designs")}>
                      <Palette className="mr-2 h-4 w-4" />
                      Saved Designs
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/login">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                  </Link>
                </Button>
              )}

              {/* Shopping Cart */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-cosmic-black text-cosmic-white flex items-center justify-center"
                    >
                      {cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search frames, sizes or styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-muted"
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="container-wide py-4">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-foreground hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
