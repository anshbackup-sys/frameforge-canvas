-- Create product_collections junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, collection_id)
);

-- Enable RLS
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_collections
CREATE POLICY "Anyone can view product collections"
  ON public.product_collections
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product collections"
  ON public.product_collections
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));