-- Run this in your Supabase SQL Editor
create table if not exists public.waitlist (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  business_name text,
  city text,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

create policy "Only service role can read waitlist" on public.waitlist
  for select using (false);
