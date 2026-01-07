import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Palette, Trash2, Share2, ShoppingCart, Edit, ExternalLink, Copy } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface FrameConfig {
  material: string;
  size: string;
  color: string;
  finish: string;
  matting: string;
  glazing: string;
  mounting: string;
  matWidth: number;
  engraving: string;
}

interface SavedDesign {
  id: string;
  name: string;
  image_url: string | null;
  frame_config: FrameConfig;
  total_price: number;
  share_code: string | null;
  created_at: string;
}

const SavedDesigns = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentShareLink, setCurrentShareLink] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchDesigns();
    }
  }, [user, authLoading, navigate]);

  const fetchDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setDesigns((data || []).map(d => ({
        ...d,
        frame_config: d.frame_config as unknown as FrameConfig
      })));
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast.error('Failed to load saved designs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      const { error } = await supabase
        .from('saved_designs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDesigns(designs.filter(d => d.id !== id));
      toast.success('Design deleted');
    } catch (error) {
      console.error('Error deleting design:', error);
      toast.error('Failed to delete design');
    }
  };

  const handleShare = (design: SavedDesign) => {
    const link = `${window.location.origin}/custom-builder?design=${design.share_code}`;
    setCurrentShareLink(link);
    setShareDialogOpen(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(currentShareLink);
    toast.success('Link copied to clipboard!');
  };

  const handleAddToCart = async (design: SavedDesign) => {
    try {
      const { error } = await supabase
        .from('custom_frame_orders')
        .insert([{
          user_id: user?.id,
          image_url: design.image_url,
          frame_config: JSON.parse(JSON.stringify(design.frame_config)),
          total_price: design.total_price,
          saved_design_id: design.id,
          status: 'pending',
        }]);

      if (error) throw error;
      toast.success('Added to cart!');
      navigate('/cart');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container-wide py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Header */}
        <div className="bg-muted/30 py-8">
          <div className="container-wide">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-2">My Saved Designs</h1>
                <p className="text-muted-foreground">
                  {designs.length} {designs.length === 1 ? 'design' : 'designs'} saved
                </p>
              </div>
              <Button asChild className="btn-hero">
                <Link to="/custom-builder">
                  <Palette className="h-4 w-4 mr-2" />
                  Create New Design
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Designs Grid */}
        <div className="container-wide py-8">
          {designs.length === 0 ? (
            <div className="text-center py-16">
              <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No saved designs yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first custom frame design and save it for later.
              </p>
              <Button asChild className="btn-hero">
                <Link to="/custom-builder">Start Designing</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Card key={design.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    {design.image_url ? (
                      <img
                        src={design.image_url}
                        alt={design.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Palette className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/custom-builder?design=${design.share_code}`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleShare(design)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold truncate">{design.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(design.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-lg">₹{design.total_price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {design.frame_config.material}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {design.frame_config.size}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {design.frame_config.color}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 btn-hero"
                        size="sm"
                        onClick={() => handleAddToCart(design)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(design.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Design</DialogTitle>
            <DialogDescription>
              Anyone with this link can view and customize your design.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={currentShareLink} readOnly />
            <Button onClick={copyShareLink}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SavedDesigns;
