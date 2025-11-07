-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('farmer', 'buyer', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

-- Create hubs table
CREATE TABLE public.hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  manager_id UUID REFERENCES auth.users(id),
  description TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hubs"
  ON public.hubs FOR SELECT
  USING (true);

CREATE POLICY "Managers can update their hubs"
  ON public.hubs FOR UPDATE
  USING (auth.uid() = manager_id);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  duration TEXT,
  level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  USING (true);

-- Create market listings table
CREATE TABLE public.market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available listings"
  ON public.market_listings FOR SELECT
  USING (available = true);

CREATE POLICY "Farmers can manage their listings"
  ON public.market_listings FOR ALL
  USING (auth.uid() = farmer_id);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Create trigger for profile updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();