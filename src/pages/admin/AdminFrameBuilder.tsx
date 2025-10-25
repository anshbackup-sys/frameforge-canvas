import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Frame } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FrameOption {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price_modifier: number;
  image_url: string | null;
  available: boolean;
  sort_order: number;
  created_at: string;
}

const AdminFrameBuilder = () => {
  const [options, setOptions] = useState<FrameOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<FrameOption | null>(null);
  const [formData, setFormData] = useState({
    category: 'material',
    name: '',
    description: '',
    price_modifier: 0,
    image_url: '',
    available: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_frame_options')
        .select('*')
        .order('category')
        .order('sort_order');

      if (error) throw error;
      setOptions(data || []);
    } catch (error) {
      console.error('Error fetching frame options:', error);
      toast.error('Failed to load frame options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingOption) {
        const { error } = await supabase
          .from('custom_frame_options')
          .update(formData)
          .eq('id', editingOption.id);

        if (error) throw error;
        toast.success('Frame option updated successfully');
      } else {
        const { error } = await supabase
          .from('custom_frame_options')
          .insert([formData]);

        if (error) throw error;
        toast.success('Frame option created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchOptions();
    } catch (error) {
      console.error('Error saving frame option:', error);
      toast.error('Failed to save frame option');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;

    try {
      const { error } = await supabase
        .from('custom_frame_options')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Frame option deleted successfully');
      fetchOptions();
    } catch (error) {
      console.error('Error deleting frame option:', error);
      toast.error('Failed to delete frame option');
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'material',
      name: '',
      description: '',
      price_modifier: 0,
      image_url: '',
      available: true,
      sort_order: 0,
    });
    setEditingOption(null);
  };

  const openEditDialog = (option: FrameOption) => {
    setEditingOption(option);
    setFormData({
      category: option.category,
      name: option.name,
      description: option.description || '',
      price_modifier: option.price_modifier,
      image_url: option.image_url || '',
      available: option.available,
      sort_order: option.sort_order,
    });
    setDialogOpen(true);
  };

  const filteredOptions = options.filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || option.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'material': return 'bg-blue-600';
      case 'size': return 'bg-green-600';
      case 'color': return 'bg-purple-600';
      case 'finish': return 'bg-orange-600';
      default: return 'bg-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-700 rounded w-48 animate-pulse"></div>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Frame Builder Options</h1>
          <p className="text-slate-400">{options.length} total options</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingOption ? 'Edit Frame Option' : 'Create New Frame Option'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingOption ? 'Update frame option details' : 'Add a new option for the frame builder'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="finish">Finish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Option Name</Label>
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
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_modifier">Price Modifier (₹)</Label>
                  <Input
                    id="price_modifier"
                    type="number"
                    step="0.01"
                    value={formData.price_modifier}
                    onChange={(e) => setFormData({ ...formData, price_modifier: parseFloat(e.target.value) })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {editingOption ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search options..."
                className="pl-10 bg-slate-900 border-slate-700 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="finish">Finish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-900/50 hover:bg-slate-900/50 border-slate-700">
                  <TableHead className="text-slate-300">Category</TableHead>
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Price Modifier</TableHead>
                  <TableHead className="text-slate-300">Sort Order</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      <Frame className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No frame options found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOptions.map((option) => (
                    <TableRow key={option.id} className="border-slate-700 hover:bg-slate-800/30">
                      <TableCell>
                        <Badge className={getCategoryBadgeColor(option.category)}>
                          {option.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-white">{option.name}</TableCell>
                      <TableCell className="text-slate-300">₹{option.price_modifier.toFixed(2)}</TableCell>
                      <TableCell className="text-slate-300">{option.sort_order}</TableCell>
                      <TableCell>
                        <Badge variant={option.available ? 'default' : 'secondary'}>
                          {option.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-700"
                            onClick={() => openEditDialog(option)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-700 text-red-400 hover:bg-red-900/20"
                            onClick={() => handleDelete(option.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFrameBuilder;
