import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number | null;
  reviews_count: number;
  image_url: string;
  category: string;
  size: string;
  stock: number;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchProducts(query);
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, rating, reviews_count, image_url, category, size, stock')
        .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,material.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Search Header */}
        <div className="bg-muted/30 py-8">
          <div className="container-wide">
            <h1 className="text-3xl font-serif font-bold mb-4">Search Results</h1>
            
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for frames, materials, sizes..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-12 pr-24 h-12 text-lg bg-background"
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  size="sm"
                >
                  Search
                </Button>
              </div>
            </form>

            {query && (
              <p className="mt-4 text-muted-foreground">
                {loading ? 'Searching...' : `${products.length} results for "${query}"`}
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="container-wide py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                {query ? 'No products found' : 'Start searching'}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {query 
                  ? `We couldn't find any products matching "${query}". Try different keywords or browse our collections.`
                  : 'Enter a search term to find frames, materials, and more.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" asChild>
                  <Link to="/shop">Browse All Products</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/collections">View Collections</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/custom-builder">Custom Frame Builder</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    rating: product.rating || 0,
                    reviews: product.reviews_count,
                    image: product.image_url,
                    category: product.category,
                    size: product.size,
                    inStock: product.stock > 0,
                  }}
                  viewMode="grid"
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
