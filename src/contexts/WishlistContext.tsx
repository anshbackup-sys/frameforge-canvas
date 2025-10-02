import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product_id,
        product:products (
          id,
          name,
          price,
          image_url
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching wishlist:', error);
    } else {
      setItems(data as any || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    const inWishlist = isInWishlist(productId);

    if (inWishlist) {
      const item = items.find(i => i.product_id === productId);
      if (item) {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('id', item.id);

        if (error) {
          console.error('Error removing from wishlist:', error);
          toast.error('Failed to remove from wishlist');
        } else {
          toast.success('Removed from wishlist');
          fetchWishlist();
        }
      }
    } else {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) {
        console.error('Error adding to wishlist:', error);
        toast.error('Failed to add to wishlist');
      } else {
        toast.success('Added to wishlist');
        fetchWishlist();
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount: items.length,
        loading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
