-- Add streak tracking columns to friendships
ALTER TABLE public.friendships
  ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS streak_updated_at timestamp with time zone;
