-- Add payment and tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create order status history table for tracking
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_status_history
CREATE POLICY "Users can view their order status history"
ON public.order_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_status_history.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Create trigger for orders updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policy for users to update their own orders (for cancellation)
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'processing'))
WITH CHECK (auth.uid() = user_id);