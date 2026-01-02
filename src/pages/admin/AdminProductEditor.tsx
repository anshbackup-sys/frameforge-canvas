import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  material: string;
  size: string;
  color: string;
  finish: string;
  image_url: string;
  images: string[];
  stock: string;
  featured: boolean;
}

const AdminProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    material: '',
    size: '',
    color: '',
    finish: '',
    image_url: '',
    images: [],
    stock: '',
    featured: false,
  });

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          category: data.category || '',
          material: data.material || '',
          size: data.size || '',
          color: data.color || '',
          finish: data.finish || '',
          image_url: data.image_url || '',
          images: data.images || [],
          stock: data.stock?.toString() || '',
          featured: data.featured || false,
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to compress image'));
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean = false) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error('Please upload image files only');
        }

        // Compress image
        const compressedBlob = await compressImage(file);
        
        // Generate unique filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = `products/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        return urlData.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (isPrimary && uploadedUrls[0]) {
        setFormData(prev => ({ ...prev, image_url: uploadedUrls[0] }));
      } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      }

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removePrimaryImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        material: formData.material,
        size: formData.size,
        color: formData.color,
        finish: formData.finish,
        image_url: formData.image_url,
        images: formData.images,
        stock: parseInt(formData.stock),
        featured: formData.featured,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/products')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-400">
            {isEditMode ? 'Update product details' : 'Create a new product listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Image Upload Section */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Image */}
              <div>
                <Label className="text-slate-200 mb-2 block">Primary Image</Label>
                {formData.image_url ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.image_url}
                      alt="Primary"
                      className="w-40 h-40 object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={removePrimaryImage}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full hover:bg-red-700"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-400">Upload</span>
                      </>
                    )}
                  </label>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <Label className="text-slate-200 mb-2 block">Additional Images</Label>
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Additional ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full hover:bg-red-700"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    ) : (
                      <Upload className="h-6 w-6 text-slate-400" />
                    )}
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Images are automatically compressed and uploaded to storage.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-slate-200">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="e.g., Wood Frames, Metal Frames"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-200">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-slate-200">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleChange('stock', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material" className="text-slate-200">Material</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => handleChange('material', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="e.g., Oak Wood, Aluminum"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size" className="text-slate-200">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="e.g., 8x10, 11x14"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color" className="text-slate-200">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="e.g., Natural, Black, White"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finish" className="text-slate-200">Finish</Label>
                  <Input
                    id="finish"
                    value={formData.finish}
                    onChange={(e) => handleChange('finish', e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="e.g., Matte, Glossy, Satin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white min-h-32"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleChange('featured', checked)}
                />
                <Label htmlFor="featured" className="text-slate-200 cursor-pointer">
                  Featured Product
                </Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/products')}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEditor;
