-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Custom Types
do $$ begin
    create type user_role as enum ('buyer', 'agent', 'service_provider');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type listing_type as enum ('property', 'service');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type listing_status as enum ('active', 'sold', 'rented', 'inactive');
exception
    when duplicate_object then null;
end $$;

-- Profiles Table (Extends Supabase Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  phone_number text,
  role user_role default 'buyer' not null,
  is_verified boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Listings Table
create table if not exists public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  listing_type listing_type not null,
  title text not null,
  description text not null,
  price numeric not null,
  location_name text not null,
  images text[] default '{}' not null,
  is_premium boolean default false not null,
  views_count integer default 0 not null,
  inquiries_count integer default 0 not null,
  status listing_status default 'active' not null,
  
  -- Property Specific Fields
  category text,
  bedrooms integer,
  bathrooms integer,
  land_size text,
  
  -- Service Specific Fields
  service_type text,
  rate_type text,
  years_experience integer,
  license_number text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved/Favorite Listings
create table if not exists public.saved_listings (
  user_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, listing_id)
);

-- Supabase RLS (Row Level Security) Policies
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.saved_listings enable row level security;

-- Drop existing policies if they exist to avoid duplicate errors
do $$ begin
  drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
  drop policy if exists "Users can insert their own profile" on public.profiles;
  drop policy if exists "Users can update their own profile" on public.profiles;
  
  drop policy if exists "Listings are viewable by everyone" on public.listings;
  drop policy if exists "Authenticated users can insert listings" on public.listings;
  drop policy if exists "Users can update their own listings" on public.listings;
  drop policy if exists "Users can delete their own listings" on public.listings;
  
  drop policy if exists "Users can view their own saved listings" on public.saved_listings;
  drop policy if exists "Users can insert their own saved listings" on public.saved_listings;
  drop policy if exists "Users can delete their own saved listings" on public.saved_listings;
  
  drop policy if exists "Listing images are publicly accessible" on storage.objects;
  drop policy if exists "Authenticated users can upload images" on storage.objects;
  drop policy if exists "Users can update their own images" on storage.objects;
  drop policy if exists "Users can delete their own images" on storage.objects;
end $$;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Listings Policies
create policy "Listings are viewable by everyone" on public.listings
  for select using (true);
create policy "Authenticated users can insert listings" on public.listings
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own listings" on public.listings
  for update using (auth.uid() = user_id);
create policy "Users can delete their own listings" on public.listings
  for delete using (auth.uid() = user_id);

-- Saved Listings Policies
create policy "Users can view their own saved listings" on public.saved_listings
  for select using (auth.uid() = user_id);
create policy "Users can insert their own saved listings" on public.saved_listings
  for insert with check (auth.uid() = user_id);
create policy "Users can delete their own saved listings" on public.saved_listings
  for delete using (auth.uid() = user_id);

-- Trigger to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone_number)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.phone -- Supabase auth.users.phone
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Supabase Storage Setup for listings
insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true) on conflict do nothing;

create policy "Listing images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'listing-images' );

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'listing-images' and auth.role() = 'authenticated' );

create policy "Users can update their own images"
  on storage.objects for update
  using ( bucket_id = 'listing-images' and auth.uid()::text = owner_id::text );

create policy "Users can delete their own images"
  on storage.objects for delete
  using ( bucket_id = 'listing-images' and auth.uid()::text = owner_id::text );
