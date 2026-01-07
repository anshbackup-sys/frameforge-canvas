-- Add custom_frame_order_id to cart_items for custom frame integration
ALTER TABLE public.cart_items 
ADD COLUMN IF NOT EXISTS custom_frame_order_id uuid REFERENCES public.custom_frame_orders(id) ON DELETE CASCADE;

-- Create reviews table for product reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  verified_purchase boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews" 
ON public.reviews 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger to update updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policy for custom_frame_orders to allow admins
CREATE POLICY "Admins can manage all custom frame orders" 
ON public.custom_frame_orders 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow users to update their own pending custom frame orders
CREATE POLICY "Users can update their own pending custom frame orders" 
ON public.custom_frame_orders 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

-- Add order_items insert policy for authenticated users (needed for checkout)
CREATE POLICY "Users can create order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Add order_status_history insert policy for authenticated users
CREATE POLICY "Users can create status history for their orders" 
ON public.order_status_history 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.user_id = auth.uid()
  )
);