import { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

interface ProductSelectorProps {
  selectedProductIds: string[];
  onProductsChange: (productIds: string[]) => void;
}

const ProductSelector = ({ selectedProductIds, onProductsChange }: ProductSelectorProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url, category, stock')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      onProductsChange(selectedProductIds.filter(id => id !== productId));
    } else {
      onProductsChange([...selectedProductIds, productId]);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-slate-400">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search products..."
          className="pl-10 bg-slate-800 border-slate-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="text-sm text-slate-400 mb-2">
        {selectedProductIds.length} product{selectedProductIds.length !== 1 ? 's' : ''} selected
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No products found
          </div>
        ) : (
          filteredProducts.map(product => {
            const isSelected = selectedProductIds.includes(product.id);
            return (
              <Card
                key={product.id}
                className={`p-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
                onClick={() => toggleProduct(product.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{product.name}</div>
                    <div className="text-sm text-slate-400 flex items-center gap-2">
                      <span>₹{product.price?.toLocaleString()}</span>
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                      Stock: {product.stock}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
