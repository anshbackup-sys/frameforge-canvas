import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Tag } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSelector from '@/components/admin/ProductSelector';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  featured: boolean;
  created_at: string;
  product_count?: number;
}

const AdminCollections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    featured: false,
  });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const collectionsWithCounts = await Promise.all(
        (data || []).map(async (collection) => {
          const { count } = await supabase
            .from('product_collections')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);
          return { ...collection, product_count: count || 0 };
        })
      );

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionProducts = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_collections')
        .select('product_id')
        .eq('collection_id', collectionId);

      if (error) throw error;
      return (data || []).map(pc => pc.product_id);
    } catch (error) {
      console.error('Error fetching collection products:', error);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let collectionId: string;

      if (editingCollection) {
        const { error } = await supabase
          .from('collections')
          .update(formData)
          .eq('id', editingCollection.id);

        if (error) throw error;
        collectionId = editingCollection.id;
        toast.success('Collection updated successfully');
      } else {
        const { data, error } = await supabase
          .from('collections')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        collectionId = data.id;
        toast.success('Collection created successfully');
      }

      const { error: deleteError } = await supabase
        .from('product_collections')
        .delete()
        .eq('collection_id', collectionId);

      if (deleteError) throw deleteError;

      if (selectedProductIds.length > 0) {
        const productCollections = selectedProductIds.map(productId => ({
          collection_id: collectionId,
          product_id: productId,
        }));

        const { error: insertError } = await supabase
          .from('product_collections')
          .insert(productCollections);

        if (insertError) throw insertError;
      }

      setDialogOpen(false);
      resetForm();
      fetchCollections();
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection? This will not delete the products.')) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Collection deleted successfully');
      fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      featured: false,
    });
    setSelectedProductIds([]);
    setEditingCollection(null);
  };

  const openEditDialog = async (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      image_url: collection.image_url || '',
      featured: collection.featured,
    });
    const productIds = await fetchCollectionProducts(collection.id);
    setSelectedProductIds(productIds);
    setDialogOpen(true);
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Collections Management</h1>
          <p className="text-gray-600">{collections.length} total collections</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900">{editingCollection ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingCollection ? 'Update collection details and tag products' : 'Add a new collection and tag products to it'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                  <TabsTrigger value="details" className="data-[state=active]:bg-white">Collection Details</TabsTrigger>
                  <TabsTrigger value="products" className="data-[state=active]:bg-white">
                    <Tag className="h-4 w-4 mr-2" />
                    Tag Products ({selectedProductIds.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700">Collection Name *</Label>
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
                    <Label className="text-gray-700">Collection Image</Label>
                    <AdminImageUpload
                      bucket="product-images"
                      folder="collections"
                      currentImage={formData.image_url}
                      onUpload={(url) => setFormData({ ...formData, image_url: url })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured" className="text-gray-700">Featured Collection</Label>
                  </div>
                </TabsContent>
                <TabsContent value="products" className="mt-4">
                  <ProductSelector
                    selectedProductIds={selectedProductIds}
                    onProductsChange={setSelectedProductIds}
                  />
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-300">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingCollection ? 'Update' : 'Create')}
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
                placeholder="Search collections..."
                className="pl-10 bg-white border-gray-300 text-gray-900 focus:border-primary focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No collections found</p>
              </div>
            ) : (
              filteredCollections.map((collection) => (
                <Card key={collection.id} className="bg-white border-gray-200 overflow-hidden group hover:border-primary hover:shadow-lg transition-all">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {collection.image_url ? (
                      <img src={collection.image_url} alt={collection.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {collection.featured && (
                      <Badge className="absolute top-2 right-2 bg-primary text-white">
                        Featured
                      </Badge>
                    )}
                    {collection.product_count !== undefined && (
                      <Badge className="absolute top-2 left-2 bg-gray-900/80 text-white">
                        <Tag className="h-3 w-3 mr-1" />
                        {collection.product_count} Products
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{collection.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                      {collection.description || 'No description'}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-300 hover:bg-gray-100"
                        onClick={() => openEditDialog(collection)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(collection.id)}
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

export default AdminCollections;
