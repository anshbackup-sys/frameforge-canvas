-- Create collections table
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view collections
CREATE POLICY "Anyone can view collections"
  ON public.collections
  FOR SELECT
  USING (true);

-- Add collection_id to products table
ALTER TABLE public.products
ADD COLUMN collection_id uuid REFERENCES public.collections(id);

-- Insert sample collections
INSERT INTO public.collections (name, description, image_url, featured) VALUES
  ('Cosmic Minimalist', 'Clean lines meet cosmic aesthetics', '/placeholder.svg', true),
  ('Stellar Classic', 'Timeless elegance with cosmic touch', '/placeholder.svg', true),
  ('Nebula Modern', 'Contemporary cosmic designs', '/placeholder.svg', true),
  ('Galaxy Vintage', 'Retro meets cosmic sophistication', '/placeholder.svg', false),
  ('Space Luxury', 'Premium cosmic materials', '/placeholder.svg', false),
  ('Cosmic Art', 'Artistic cosmic expressions', '/placeholder.svg', false);