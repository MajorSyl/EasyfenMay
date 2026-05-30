/*
  # Initial Schema for Easyfen Marketplace

  1. New Tables
    - `profiles` - User profiles linked to auth.users (id, full_name, phone_number, role, is_verified)
    - `listings` - All marketplace listings for properties and services
    - `saved_listings` - User bookmarks/favorites (user_id + listing_id composite key)

  2. Custom Enum Types
    - `user_role`: buyer, agent, service_provider
    - `listing_type`: property, service
    - `listing_status`: active, sold, rented, inactive

  3. Security
    - RLS enabled on all tables
    - Profiles: public read, owner insert/update
    - Listings: public read, authenticated insert, owner update/delete
    - Saved listings: owner read/insert/delete only

  4. Automation
    - Trigger: auto-create profile on new auth user signup
    - Storage bucket: listing-images (public)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('buyer', 'agent', 'service_provider');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_type AS ENUM ('property', 'service');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('active', 'sold', 'rented', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  phone_number text,
  role user_role DEFAULT 'buyer' NOT NULL,
  is_verified boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_type listing_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  location_name text NOT NULL DEFAULT '',
  images text[] DEFAULT '{}' NOT NULL,
  is_premium boolean DEFAULT false NOT NULL,
  views_count integer DEFAULT 0 NOT NULL,
  inquiries_count integer DEFAULT 0 NOT NULL,
  status listing_status DEFAULT 'active' NOT NULL,
  category text,
  bedrooms integer,
  bathrooms integer,
  land_size text,
  service_type text,
  rate_type text,
  years_experience integer,
  license_number text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Saved Listings Table
CREATE TABLE IF NOT EXISTS public.saved_listings (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, listing_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
END $$;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Listings Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
  DROP POLICY IF EXISTS "Authenticated users can insert listings" ON public.listings;
  DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
  DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
END $$;

CREATE POLICY "Listings are viewable by everyone"
  ON public.listings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved Listings Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own saved listings" ON public.saved_listings;
  DROP POLICY IF EXISTS "Users can insert their own saved listings" ON public.saved_listings;
  DROP POLICY IF EXISTS "Users can delete their own saved listings" ON public.saved_listings;
END $$;

CREATE POLICY "Users can view their own saved listings"
  ON public.saved_listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved listings"
  ON public.saved_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved listings"
  ON public.saved_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Listing images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
END $$;

CREATE POLICY "Listing images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'listing-images');

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'listing-images' AND auth.uid()::text = owner_id::text);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'listing-images' AND auth.uid()::text = owner_id::text);
