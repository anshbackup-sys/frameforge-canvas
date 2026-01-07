import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import AdminImageUpload from '@/components/admin/AdminImageUpload';
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
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bundles Management</h1>
          <p className="text-gray-600">{bundles.length} total bundles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">{editingBundle ? 'Edit Bundle' : 'Create New Bundle'}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingBundle ? 'Update bundle details and products' : 'Add a new bundle to your store'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bundle Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Bundle Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Bundle Image</Label>
                    <AdminImageUpload
                      bucket="product-images"
                      folder="bundles"
                      currentImage={formData.image_url}
                      onUpload={(url) => setFormData({ ...formData, image_url: url })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount" className="text-gray-700">Discount Percentage</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) })}
                      className="bg-white border-gray-300 text-gray-900"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured" className="text-gray-700">Featured Bundle</Label>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700">Select Products</Label>
                    <Badge className="bg-gray-100 text-gray-700">
                      {selectedProducts.length} selected
                    </Badge>
                  </div>
                  <ScrollArea className="h-80 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-2">
                      {products.map((product) => {
                        const isSelected = selectedProducts.some(p => p.product_id === product.id);
                        const bundleProduct = selectedProducts.find(p => p.product_id === product.id);
                        
                        return (
                          <div
                            key={product.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              isSelected ? 'bg-primary/10 border border-primary' : 'bg-white hover:bg-gray-100 border border-gray-200'
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
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">₹{product.price.toLocaleString()}</p>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-gray-500">Qty:</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={bundleProduct?.quantity || 1}
                                  onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value))}
                                  className="w-16 h-8 bg-white border-gray-300 text-sm"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {selectedProducts.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Original Total:</span>
                        <span className="text-gray-900">₹{calculateBundleTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Discount ({formData.discount_percentage}%):</span>
                        <span className="text-emerald-600 font-medium">
                          -₹{(calculateBundleTotal() * formData.discount_percentage / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                        <span className="text-gray-900">Bundle Price:</span>
                        <span className="text-primary">
                          ₹{(calculateBundleTotal() * (1 - formData.discount_percentage / 100)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingBundle ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bundles..."
                className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-primary focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBundles.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No bundles found</p>
              </div>
            ) : (
              filteredBundles.map((bundle) => (
                <Card key={bundle.id} className="bg-white border-gray-200 overflow-hidden group hover:border-primary hover:shadow-lg transition-all">
                  <div className="aspect-video bg-gray-100 relative">
                    {bundle.image_url ? (
                      <img src={bundle.image_url} alt={bundle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {bundle.featured && (
                      <Badge className="absolute top-2 right-2 bg-primary text-white">
                        Featured
                      </Badge>
                    )}
                    <Badge className="absolute top-2 left-2 bg-emerald-600 text-white">
                      {bundle.discount_percentage}% OFF
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{bundle.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {bundle.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-gray-100 text-gray-700">
                        {bundle.product_count || 0} products
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-300 hover:bg-gray-100"
                        onClick={() => openEditDialog(bundle)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
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
