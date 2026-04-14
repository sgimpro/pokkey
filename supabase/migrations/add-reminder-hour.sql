ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reminder_hour integer DEFAULT 9;
