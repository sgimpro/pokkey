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
