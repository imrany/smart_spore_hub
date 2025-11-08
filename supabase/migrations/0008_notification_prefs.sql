-- alter table public.notification_preferences add column user_id to unique;
ALTER TABLE public.notification_preferences DROP COLUMN user_id;
ALTER TABLE public.notification_preferences ADD COLUMN user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;
