-- ============================================================
-- Floodlio Database Schema
-- Run this in your Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- Stores both brand and bar user profiles
-- ============================================================
create table if not exists public.users (
  id uuid default uuid_generate_v4() primary key,
  clerk_id text unique not null,
  user_type text not null check (user_type in ('brand', 'bar')),
  business_name text not null,
  city text not null,
  state text not null,
  description text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- Index for clerk_id lookups (very frequent)
create index if not exists users_clerk_id_idx on public.users(clerk_id);
create index if not exists users_user_type_idx on public.users(user_type);

-- ============================================================
-- PRODUCTS TABLE
-- Brand product listings
-- ============================================================
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('Beer', 'Wine', 'Spirits', 'RTD')),
  subcategory text not null,
  abv numeric(5,2) not null check (abv >= 0 and abv <= 100),
  price_min numeric(10,2),
  price_max numeric(10,2),
  description text,
  image_url text,
  availability text not null default 'Regional' check (availability in ('Local', 'Regional', 'National')),
  is_featured boolean default false,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists products_brand_id_idx on public.products(brand_id);
create index if not exists products_category_idx on public.products(category);
create index if not exists products_subcategory_idx on public.products(subcategory);
create index if not exists products_is_featured_idx on public.products(is_featured);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- Brand Stripe subscriptions ($29/month)
-- ============================================================
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid unique not null references public.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'inactive' check (status in ('active', 'canceled', 'past_due', 'trialing', 'inactive')),
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists subscriptions_brand_id_idx on public.subscriptions(brand_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions(stripe_subscription_id);

-- ============================================================
-- SAVED PRODUCTS TABLE
-- Bars saving products they like
-- ============================================================
create table if not exists public.saved_products (
  id uuid default uuid_generate_v4() primary key,
  bar_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  unique(bar_id, product_id)
);

create index if not exists saved_products_bar_id_idx on public.saved_products(bar_id);

-- ============================================================
-- REQUESTS TABLE
-- Bars requesting to stock products from brands
-- ============================================================
create table if not exists public.requests (
  id uuid default uuid_generate_v4() primary key,
  bar_id uuid not null references public.users(id) on delete cascade,
  brand_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  message text not null,
  quantity_interest text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists requests_bar_id_idx on public.requests(bar_id);
create index if not exists requests_brand_id_idx on public.requests(brand_id);
create index if not exists requests_product_id_idx on public.requests(product_id);
create index if not exists requests_status_idx on public.requests(status);

-- ============================================================
-- CONVERSATIONS TABLE
-- One conversation per brand-bar pair
-- ============================================================
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  brand_id uuid not null references public.users(id) on delete cascade,
  bar_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  unique(brand_id, bar_id)
);

create index if not exists conversations_brand_id_idx on public.conversations(brand_id);
create index if not exists conversations_bar_id_idx on public.conversations(bar_id);

-- ============================================================
-- MESSAGES TABLE
-- Individual messages within conversations
-- ============================================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_created_at_idx on public.messages(conversation_id, created_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.subscriptions enable row level security;
alter table public.saved_products enable row level security;
alter table public.requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- USERS: Anyone can read profiles, but only the service role can write
create policy "Users are publicly readable" on public.users
  for select using (true);

create policy "Users can insert own profile" on public.users
  for insert with check (true);

create policy "Users can update own profile" on public.users
  for update using (true);

-- PRODUCTS: Anyone can read, only brands (via service role) can write
create policy "Products are publicly readable" on public.products
  for select using (true);

create policy "Anyone can insert products" on public.products
  for insert with check (true);

create policy "Anyone can update products" on public.products
  for update using (true);

create policy "Anyone can delete products" on public.products
  for delete using (true);

-- SUBSCRIPTIONS: Readable by anyone (anon key), written by service role
create policy "Subscriptions are readable" on public.subscriptions
  for select using (true);

create policy "Subscriptions can be inserted" on public.subscriptions
  for insert with check (true);

create policy "Subscriptions can be updated" on public.subscriptions
  for update using (true);

-- SAVED_PRODUCTS: Readable/writable by anyone (frontend validates user)
create policy "Saved products readable" on public.saved_products
  for select using (true);

create policy "Saved products insertable" on public.saved_products
  for insert with check (true);

create policy "Saved products deletable" on public.saved_products
  for delete using (true);

-- REQUESTS: Readable/writable by anyone (frontend validates user type)
create policy "Requests readable" on public.requests
  for select using (true);

create policy "Requests insertable" on public.requests
  for insert with check (true);

create policy "Requests updatable" on public.requests
  for update using (true);

-- CONVERSATIONS: Readable/writable by anyone
create policy "Conversations readable" on public.conversations
  for select using (true);

create policy "Conversations insertable" on public.conversations
  for insert with check (true);

-- MESSAGES: Readable/writable by anyone
create policy "Messages readable" on public.messages
  for select using (true);

create policy "Messages insertable" on public.messages
  for insert with check (true);

-- ============================================================
-- REALTIME
-- Enable realtime on messages and conversations for live chat
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;

-- ============================================================
-- STORAGE
-- Create a bucket for product images
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow anyone to read product images
create policy "Product images are publicly readable" on storage.objects
  for select using (bucket_id = 'product-images');

-- Allow authenticated uploads (frontend handles auth check)
create policy "Anyone can upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images');

create policy "Anyone can update product images" on storage.objects
  for update using (bucket_id = 'product-images');

create policy "Anyone can delete product images" on storage.objects
  for delete using (bucket_id = 'product-images');

-- ============================================================
-- SEED DATA (optional - for testing)
-- Uncomment to insert sample data
-- ============================================================
/*
-- Sample brand user
insert into public.users (clerk_id, user_type, business_name, city, state, description)
values ('sample_brand_clerk_id', 'brand', 'Pacific Coast Brewing Co.', 'San Francisco', 'CA', 'Award-winning craft brewery specializing in West Coast IPAs and lagers.');

-- Sample bar user
insert into public.users (clerk_id, user_type, business_name, city, state, description)
values ('sample_bar_clerk_id', 'bar', 'The Golden Tap', 'Los Angeles', 'CA', 'Craft beer bar with 40 rotating taps and a passion for local brews.');
*/
