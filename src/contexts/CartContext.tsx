import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  product_id: string | null;
  custom_frame_order_id: string | null;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string;
    stock: number;
  } | null;
  custom_frame_order?: {
    id: string;
    image_url: string | null;
    frame_config: any;
    total_price: number;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  addCustomFrameToCart: (customFrameOrderId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch cart items with products
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          custom_frame_order_id,
          quantity,
          product:products (
            name,
            price,
            image_url,
            stock
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch custom frame orders for items that have them
      const customFrameIds = cartItems
        ?.filter(item => item.custom_frame_order_id)
        .map(item => item.custom_frame_order_id) || [];

      let customFrameOrders: any[] = [];
      if (customFrameIds.length > 0) {
        const { data: cfData } = await supabase
          .from('custom_frame_orders')
          .select('id, image_url, frame_config, total_price')
          .in('id', customFrameIds);
        customFrameOrders = cfData || [];
      }

      // Merge custom frame order data into cart items
      const mergedItems = cartItems?.map(item => ({
        ...item,
        custom_frame_order: item.custom_frame_order_id
          ? customFrameOrders.find(cf => cf.id === item.custom_frame_order_id)
          : null
      })) || [];

      setItems(mergedItems as CartItem[]);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    // Check if item already exists
    const existingItem = items.find(item => item.product_id === productId && !item.custom_frame_order_id);
    
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
      
      if (error) {
        console.error('Error updating cart:', error);
        toast.error('Failed to update cart');
      } else {
        toast.success('Cart updated');
        fetchCart();
      }
    } else {
      // Add new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity
        });

      if (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add to cart');
      } else {
        toast.success('Added to cart');
        fetchCart();
      }
    }
  };

  const addCustomFrameToCart = async (customFrameOrderId: string) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        custom_frame_order_id: customFrameOrderId,
        quantity: 1
      });

    if (error) {
      console.error('Error adding custom frame to cart:', error);
      toast.error('Failed to add to cart');
    } else {
      toast.success('Custom frame added to cart');
      fetchCart();
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update quantity');
    } else {
      fetchCart();
    }
  };

  const removeFromCart = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    } else {
      toast.success('Removed from cart');
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } else {
      setItems([]);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        loading,
        addToCart,
        addCustomFrameToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};