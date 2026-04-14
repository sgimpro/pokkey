-- ============================================
-- POKEY: Full Database Setup
-- Paste this entire file into Supabase SQL Editor and hit Run
-- ============================================

-- Users table
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text unique not null,
  score integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friendships table
create table public.friendships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  friend_id uuid references public.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted')) not null,
  last_nudge_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id)
);

-- Nudges table
create table public.nudges (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.users(id) on delete cascade not null,
  receiver_id uuid references public.users(id) on delete cascade not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Push subscriptions table
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subscription jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pending invites (for non-app users)
create table public.pending_invites (
  id uuid default gen_random_uuid() primary key,
  inviter_id uuid references public.users(id) on delete cascade not null,
  phone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(inviter_id, phone)
);

-- Score increment function
create or replace function increment_score(user_id uuid, amount integer)
returns void as $$
  update public.users set score = score + amount where id = user_id;
$$ language sql security definer;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.users enable row level security;
alter table public.friendships enable row level security;
alter table public.nudges enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.pending_invites enable row level security;

-- Users: can read all, update own
create policy "Users are viewable by authenticated users" on public.users
  for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Friendships: users see their own
create policy "Users see own friendships" on public.friendships
  for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users create own friendships" on public.friendships
  for insert with check (auth.uid() = user_id);
create policy "Users update own friendships" on public.friendships
  for update using (auth.uid() = user_id or auth.uid() = friend_id);

-- Nudges: users see nudges they sent or received
create policy "Users see own nudges" on public.nudges
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users create nudges" on public.nudges
  for insert with check (auth.uid() = sender_id);

-- Push subscriptions: own only
create policy "Users manage own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- Pending invites: own only
create policy "Users manage own invites" on public.pending_invites
  for all using (auth.uid() = inviter_id);
