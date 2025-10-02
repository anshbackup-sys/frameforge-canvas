-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  material TEXT,
  size TEXT,
  color TEXT,
  finish TEXT,
  image_url TEXT,
  images TEXT[],
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  rating DECIMAL(2,1),
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cart table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create wishlist table
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  total DECIMAL(10,2),
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Cart policies
CREATE POLICY "Users can view their own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own cart"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist"
  ON public.wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own wishlist"
  ON public.wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
  ON public.wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Addresses policies
CREATE POLICY "Users can view their own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_order_number TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.orders;
  new_order_number := 'KGA-' || LPAD(counter::TEXT, 5, '0');
  RETURN new_order_number;
END;
$$;

-- Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, description, price, category, material, size, color, finish, image_url, images, stock, featured, rating, reviews_count) VALUES
('Cosmic Black Frame', 'Premium black wooden frame with cosmic finish', 1299.00, 'Wood Frames', 'Oak Wood', '8x10', 'Black', 'Matte', '/placeholder.svg', ARRAY['/placeholder.svg'], 50, true, 4.8, 124),
('Galaxy White Frame', 'Elegant white frame with metallic accents', 1499.00, 'Metal Frames', 'Aluminum', '11x14', 'White', 'Glossy', '/placeholder.svg', ARRAY['/placeholder.svg'], 40, true, 4.9, 98),
('Nebula Silver Frame', 'Modern silver frame with cosmic patterns', 1699.00, 'Metal Frames', 'Stainless Steel', '16x20', 'Silver', 'Brushed', '/placeholder.svg', ARRAY['/placeholder.svg'], 30, true, 4.7, 76),
('Stardust Gold Frame', 'Luxurious gold-finished wooden frame', 2199.00, 'Wood Frames', 'Walnut', '12x16', 'Gold', 'Polished', '/placeholder.svg', ARRAY['/placeholder.svg'], 25, false, 4.8, 54),
('Eclipse Black Frame', 'Sleek black metal frame with UV protection', 1899.00, 'Metal Frames', 'Aluminum', '18x24', 'Black', 'Matte', '/placeholder.svg', ARRAY['/placeholder.svg'], 35, true, 4.9, 112),
('Aurora White Frame', 'White wooden frame with natural grain', 1399.00, 'Wood Frames', 'Pine', '10x12', 'White', 'Natural', '/placeholder.svg', ARRAY['/placeholder.svg'], 45, false, 4.6, 89),
('Constellation Frame Set', 'Set of 3 matching cosmic frames', 3499.00, 'Frame Sets', 'Mixed', 'Various', 'Black/White', 'Mixed', '/placeholder.svg', ARRAY['/placeholder.svg'], 20, true, 4.9, 156),
('Meteor Black Frame', 'Industrial black metal frame', 1599.00, 'Metal Frames', 'Iron', '14x18', 'Black', 'Industrial', '/placeholder.svg', ARRAY['/placeholder.svg'], 30, false, 4.7, 67),
('Moon Glow Frame', 'LED-backlit cosmic frame', 2499.00, 'Special Frames', 'Acrylic', '16x20', 'White', 'LED', '/placeholder.svg', ARRAY['/placeholder.svg'], 15, true, 5.0, 203),
('Solar Flare Gold Frame', 'Ornate gold frame with intricate details', 2799.00, 'Wood Frames', 'Mahogany', '20x24', 'Gold', 'Ornate', '/placeholder.svg', ARRAY['/placeholder.svg'], 12, false, 4.8, 45),
('Comet Silver Frame', 'Minimalist silver aluminum frame', 1199.00, 'Metal Frames', 'Aluminum', '8x10', 'Silver', 'Matte', '/placeholder.svg', ARRAY['/placeholder.svg'], 60, false, 4.5, 98),
('Galaxy Grid Frame', '3x3 grid frame for multiple photos', 2899.00, 'Special Frames', 'Wood/Glass', '24x24', 'Black', 'Modern', '/placeholder.svg', ARRAY['/placeholder.svg'], 18, true, 4.9, 134),
('Orbit White Frame', 'Circular white frame with cosmic design', 1799.00, 'Special Frames', 'Composite', '16" dia', 'White', 'Glossy', '/placeholder.svg', ARRAY['/placeholder.svg'], 22, false, 4.7, 76),
('Asteroid Black Frame', 'Textured black frame with depth', 1399.00, 'Wood Frames', 'Oak', '11x14', 'Black', 'Textured', '/placeholder.svg', ARRAY['/placeholder.svg'], 40, false, 4.6, 54),
('Starlight Frame', 'Crystal-clear acrylic floating frame', 2199.00, 'Special Frames', 'Acrylic', '12x18', 'Clear', 'Polished', '/placeholder.svg', ARRAY['/placeholder.svg'], 25, true, 4.8, 89),
('Dark Matter Frame', 'Ultra-thin black metal frame', 1599.00, 'Metal Frames', 'Steel', '10x15', 'Black', 'Ultra-thin', '/placeholder.svg', ARRAY['/placeholder.svg'], 35, false, 4.7, 67),
('Celestial Bundle', 'Complete framing bundle with tools', 4999.00, 'Bundles', 'Various', 'Various', 'Mixed', 'Mixed', '/placeholder.svg', ARRAY['/placeholder.svg'], 10, true, 5.0, 178),
('Void Black Frame', 'Deep black frame with anti-glare glass', 1899.00, 'Metal Frames', 'Aluminum', '16x20', 'Black', 'Anti-glare', '/placeholder.svg', ARRAY['/placeholder.svg'], 28, false, 4.8, 92),
('Supernova Gold Frame', 'Statement gold frame with cosmic motifs', 3299.00, 'Wood Frames', 'Cherry', '24x36', 'Gold', 'Luxury', '/placeholder.svg', ARRAY['/placeholder.svg'], 8, true, 4.9, 67),
('Stellar White Frame', 'Contemporary white frame collection', 1499.00, 'Wood Frames', 'Birch', '12x12', 'White', 'Contemporary', '/placeholder.svg', ARRAY['/placeholder.svg'], 42, false, 4.6, 54);