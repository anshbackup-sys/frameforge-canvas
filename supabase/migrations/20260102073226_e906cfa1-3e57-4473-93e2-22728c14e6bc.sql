-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('frame-options', 'frame-options', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('custom-designs', 'custom-designs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

-- Storage policies for frame-options bucket
CREATE POLICY "Public can view frame option images"
ON storage.objects FOR SELECT
USING (bucket_id = 'frame-options');

CREATE POLICY "Admins can upload frame option images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'frame-options' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update frame option images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'frame-options' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete frame option images"
ON storage.objects FOR DELETE
USING (bucket_id = 'frame-options' AND has_role(auth.uid(), 'admin'));

-- Storage policies for custom-designs bucket (user uploads)
CREATE POLICY "Public can view custom designs"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-designs');

CREATE POLICY "Authenticated users can upload custom designs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'custom-designs' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own custom designs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'custom-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own custom designs"
ON storage.objects FOR DELETE
USING (bucket_id = 'custom-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create saved_designs table for custom frame designs
CREATE TABLE IF NOT EXISTS public.saved_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Custom Frame',
  image_url TEXT,
  frame_config JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saved_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved designs"
ON public.saved_designs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved designs"
ON public.saved_designs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved designs"
ON public.saved_designs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved designs"
ON public.saved_designs FOR DELETE
USING (auth.uid() = user_id);

-- Allow public viewing of shared designs via share_code
CREATE POLICY "Anyone can view shared designs"
ON public.saved_designs FOR SELECT
USING (share_code IS NOT NULL);

-- Create custom_frame_orders table for cart integration
CREATE TABLE IF NOT EXISTS public.custom_frame_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  saved_design_id UUID REFERENCES public.saved_designs(id) ON DELETE SET NULL,
  image_url TEXT,
  frame_config JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.custom_frame_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom frame orders"
ON public.custom_frame_orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom frame orders"
ON public.custom_frame_orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Seed custom_frame_options with comprehensive data
INSERT INTO public.custom_frame_options (category, name, description, price_modifier, available, sort_order) VALUES
-- Materials
('material', 'Oak Wood', 'Classic oak with warm honey tones', 0, true, 1),
('material', 'Walnut Wood', 'Rich dark brown hardwood', 200, true, 2),
('material', 'Pine Wood', 'Light and affordable softwood', -100, true, 3),
('material', 'Mahogany Wood', 'Premium reddish-brown hardwood', 400, true, 4),
('material', 'Aluminum', 'Modern sleek metal frame', 150, true, 5),
('material', 'Steel', 'Industrial brushed steel', 250, true, 6),
('material', 'Acrylic', 'Clear modern floating effect', 100, true, 7),
-- Sizes
('size', '5x7 inches', 'Small desktop size', -200, true, 1),
('size', '8x10 inches', 'Standard portrait size', 0, true, 2),
('size', '11x14 inches', 'Medium wall size', 300, true, 3),
('size', '16x20 inches', 'Large statement piece', 600, true, 4),
('size', '20x24 inches', 'Extra large gallery size', 900, true, 5),
('size', '24x36 inches', 'Poster size', 1200, true, 6),
('size', 'Custom Size', 'Specify your dimensions', 500, true, 7),
-- Colors
('color', 'Natural Oak', 'Light natural wood finish', 0, true, 1),
('color', 'Walnut Brown', 'Rich dark brown stain', 50, true, 2),
('color', 'Espresso', 'Deep dark brown', 50, true, 3),
('color', 'Classic Black', 'Matte black finish', 0, true, 4),
('color', 'Pure White', 'Clean white finish', 0, true, 5),
('color', 'Silver', 'Metallic silver', 75, true, 6),
('color', 'Gold', 'Elegant gold finish', 100, true, 7),
('color', 'Rose Gold', 'Modern rose gold', 100, true, 8),
-- Finishes
('finish', 'Matte', 'Non-reflective smooth finish', 0, true, 1),
('finish', 'Glossy', 'High shine lacquer finish', 50, true, 2),
('finish', 'Satin', 'Subtle low sheen finish', 25, true, 3),
('finish', 'Distressed', 'Vintage weathered look', 100, true, 4),
('finish', 'Hand-rubbed', 'Artisan hand-finished', 150, true, 5),
-- Matting
('matting', 'No Mat', 'Frame only, no matting', 0, true, 1),
('matting', 'White Mat', 'Classic white acid-free mat', 200, true, 2),
('matting', 'Cream Mat', 'Warm off-white mat', 200, true, 3),
('matting', 'Black Mat', 'Dramatic black mat', 200, true, 4),
('matting', 'Gray Mat', 'Neutral gray mat', 200, true, 5),
('matting', 'Double Mat', 'Two-layer matting effect', 350, true, 6),
-- Glazing
('glazing', 'Standard Glass', 'Clear glass protection', 0, true, 1),
('glazing', 'Anti-glare Glass', 'Reduces reflections', 200, true, 2),
('glazing', 'UV Protective Glass', 'Blocks harmful UV rays', 300, true, 3),
('glazing', 'Museum Glass', 'Premium anti-reflective UV glass', 500, true, 4),
('glazing', 'Acrylic/Plexiglass', 'Lightweight shatterproof', 150, true, 5),
-- Mounting
('mounting', 'Paper Mount', 'Standard paper backing', 0, true, 1),
('mounting', 'Foam Board', 'Rigid foam backing', 100, true, 2),
('mounting', 'Archival Mount', 'Conservation-grade mounting', 250, true, 3),
('mounting', 'Float Mount', 'Image appears to float', 200, true, 4),
('mounting', 'Canvas Stretch', 'Stretched canvas mounting', 300, true, 5)
ON CONFLICT DO NOTHING;

-- Create trigger for saved_designs updated_at
CREATE TRIGGER update_saved_designs_updated_at
  BEFORE UPDATE ON public.saved_designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();