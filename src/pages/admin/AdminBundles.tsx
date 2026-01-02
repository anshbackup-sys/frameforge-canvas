import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  discount_percentage: number;
  featured: boolean;
  created_at: string;
  product_count?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

interface BundleProduct {
  product_id: string;
  quantity: number;
}

const AdminBundles = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<BundleProduct[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    discount_percentage: 0,
    featured: false,
  });

  useEffect(() => {
    fetchBundles();
    fetchProducts();
  }, []);

  const fetchBundles = async () => {
    try {
      const { data: bundlesData, error } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get product counts for each bundle
      const bundlesWithCounts = await Promise.all(
        (bundlesData || []).map(async (bundle) => {
          const { count } = await supabase
            .from('bundle_products')
            .select('*', { count: 'exact', head: true })
            .eq('bundle_id', bundle.id);
          
          return { ...bundle, product_count: count || 0 };
        })
      );

      setBundles(bundlesWithCounts);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchBundleProducts = async (bundleId: string) => {
    try {
      const { data, error } = await supabase
        .from('bundle_products')
        .select('product_id, quantity')
        .eq('bundle_id', bundleId);

      if (error) throw error;
      setSelectedProducts(data || []);
    } catch (error) {
      console.error('Error fetching bundle products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let bundleId: string;

      if (editingBundle) {
        const { error } = await supabase
          .from('bundles')
          .update(formData)
          .eq('id', editingBundle.id);

        if (error) throw error;
        bundleId = editingBundle.id;

        // Delete existing bundle products
        await supabase
          .from('bundle_products')
          .delete()
          .eq('bundle_id', bundleId);

        toast.success('Bundle updated successfully');
      } else {
        const { data, error } = await supabase
          .from('bundles')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        bundleId = data.id;
        toast.success('Bundle created successfully');
      }

      // Insert new bundle products
      if (selectedProducts.length > 0) {
        const bundleProductsData = selectedProducts.map(sp => ({
          bundle_id: bundleId,
          product_id: sp.product_id,
          quantity: sp.quantity,
        }));

        const { error: bpError } = await supabase
          .from('bundle_products')
          .insert(bundleProductsData);

        if (bpError) throw bpError;
      }

      setDialogOpen(false);
      resetForm();
      fetchBundles();
    } catch (error) {
      console.error('Error saving bundle:', error);
      toast.error('Failed to save bundle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return;

    try {
      // Delete bundle products first
      await supabase
        .from('bundle_products')
        .delete()
        .eq('bundle_id', id);

      const { error } = await supabase
        .from('bundles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Bundle deleted successfully');
      fetchBundles();
    } catch (error) {
      console.error('Error deleting bundle:', error);
      toast.error('Failed to delete bundle');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      discount_percentage: 0,
      featured: false,
    });
    setSelectedProducts([]);
    setEditingBundle(null);
  };

  const openEditDialog = async (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormData({
      name: bundle.name,
      description: bundle.description || '',
      image_url: bundle.image_url || '',
      discount_percentage: bundle.discount_percentage,
      featured: bundle.featured,
    });
    await fetchBundleProducts(bundle.id);
    setDialogOpen(true);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.product_id === productId);
      if (exists) {
        return prev.filter(p => p.product_id !== productId);
      } else {
        return [...prev, { product_id: productId, quantity: 1 }];
      }
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.product_id === productId ? { ...p, quantity: Math.max(1, quantity) } : p
      )
    );
  };

  const calculateBundleTotal = () => {
    return selectedProducts.reduce((total, sp) => {
      const product = products.find(p => p.id === sp.product_id);
      return total + (product?.price || 0) * sp.quantity;
    }, 0);
  };

  const filteredBundles = bundles.filter(bundle =>
    bundle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-700 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bundles Management</h1>
          <p className="text-slate-400">{bundles.length} total bundles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBundle ? 'Edit Bundle' : 'Create New Bundle'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingBundle ? 'Update bundle details and products' : 'Add a new bundle to your store'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bundle Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Bundle Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Featured Bundle</Label>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Select Products</Label>
                    <Badge variant="secondary">
                      {selectedProducts.length} selected
                    </Badge>
                  </div>
                  <ScrollArea className="h-80 border border-slate-700 rounded-lg p-4">
                    <div className="space-y-2">
                      {products.map((product) => {
                        const isSelected = selectedProducts.some(p => p.product_id === product.id);
                        const bundleProduct = selectedProducts.find(p => p.product_id === product.id);
                        
                        return (
                          <div
                            key={product.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              isSelected ? 'bg-blue-600/20 border border-blue-600' : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleProduct(product.id)}
                            />
                            <img
                              src={product.image_url || '/placeholder.svg'}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{product.name}</p>
                              <p className="text-xs text-slate-400">₹{product.price.toLocaleString()}</p>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-slate-400">Qty:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={bundleProduct?.quantity || 1}
                                  onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value))}
                                  className="w-16 h-8 bg-slate-700 border-slate-600 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {selectedProducts.length > 0 && (
                    <div className="p-4 bg-slate-800 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Original Total:</span>
                        <span className="text-white">₹{calculateBundleTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Discount ({formData.discount_percentage}%):</span>
                        <span className="text-green-400">
                          -₹{(calculateBundleTotal() * formData.discount_percentage / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-slate-700">
                        <span className="text-white">Bundle Price:</span>
                        <span className="text-white">
                          ₹{(calculateBundleTotal() * (1 - formData.discount_percentage / 100)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {editingBundle ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search bundles..."
                className="pl-10 bg-slate-900 border-slate-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBundles.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No bundles found</p>
              </div>
            ) : (
              filteredBundles.map((bundle) => (
                <Card key={bundle.id} className="bg-slate-900/50 border-slate-700 overflow-hidden">
                  <div className="aspect-video bg-slate-800 relative">
                    {bundle.image_url ? (
                      <img src={bundle.image_url} alt={bundle.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-slate-600" />
                      </div>
                    )}
                    {bundle.featured && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600">
                        Featured
                      </Badge>
                    )}
                    {bundle.discount_percentage > 0 && (
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        {bundle.discount_percentage}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{bundle.name}</h3>
                    <p className="text-sm text-slate-400 mb-2">
                      {bundle.product_count} products included
                    </p>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {bundle.description || 'No description'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-700"
                        onClick={() => openEditDialog(bundle)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-700 text-red-400 hover:bg-red-900/20"
                        onClick={() => handleDelete(bundle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBundles;
