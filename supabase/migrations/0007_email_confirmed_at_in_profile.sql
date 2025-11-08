-- add email_confirmed_at column to profiles table
ALTER TABLE public.profiles ADD COLUMN email_confirmed_at TIMESTAMP WITH TIME ZONE;
