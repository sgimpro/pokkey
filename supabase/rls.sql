-- Enable RLS
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
