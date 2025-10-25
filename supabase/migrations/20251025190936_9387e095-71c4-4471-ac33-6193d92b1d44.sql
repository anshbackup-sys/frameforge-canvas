-- Fix foreign key relationship for orders to profiles
-- This ensures the join works correctly in queries

-- Add foreign key if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE public.orders
    ADD CONSTRAINT orders_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create bundles table for bundle management
CREATE TABLE IF NOT EXISTS public.bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  discount_percentage NUMERIC DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for bundles
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

-- RLS policies for bundles
CREATE POLICY "Anyone can view bundles"
  ON public.bundles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage bundles"
  ON public.bundles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create bundle_products junction table
CREATE TABLE IF NOT EXISTS public.bundle_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(bundle_id, product_id)
);

-- Enable RLS for bundle_products
ALTER TABLE public.bundle_products ENABLE ROW LEVEL SECURITY;

-- RLS policies for bundle_products
CREATE POLICY "Anyone can view bundle products"
  ON public.bundle_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage bundle products"
  ON public.bundle_products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create custom_frame_options table for custom builder
CREATE TABLE IF NOT EXISTS public.custom_frame_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'material', 'size', 'color', 'finish'
  name TEXT NOT NULL,
  description TEXT,
  price_modifier NUMERIC DEFAULT 0,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for custom_frame_options
ALTER TABLE public.custom_frame_options ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_frame_options
CREATE POLICY "Anyone can view frame options"
  ON public.custom_frame_options FOR SELECT
  USING (available = true);

CREATE POLICY "Admins can manage frame options"
  ON public.custom_frame_options FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for collections management by admins
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections"
  ON public.collections FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for products management by admins
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger to update updated_at on bundles
CREATE OR REPLACE FUNCTION update_bundles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bundles_timestamp
  BEFORE UPDATE ON public.bundles
  FOR EACH ROW
  EXECUTE FUNCTION update_bundles_updated_at();