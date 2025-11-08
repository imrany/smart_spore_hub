 -- drop email field from profiles
 ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
ALTER TABLE public.profiles ADD COLUMN email TEXT;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Verify none are null:
SELECT COUNT(*) AS missing_email_count FROM public.profiles WHERE email IS NULL OR email = '';

ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
