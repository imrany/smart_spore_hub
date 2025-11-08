-- =============================================
-- DOWN Migration - Drop all tables
-- =============================================

-- Drop realtime
ALTER PUBLICATION supabase_realtime DROP TABLE public.alerts;
ALTER PUBLICATION supabase_realtime DROP TABLE public.sensor_readings;

-- Drop trigger and function
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop all policies
DROP POLICY IF EXISTS "Authenticated users can update alerts" ON public.alerts;
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.alerts;
DROP POLICY IF EXISTS "Service role can insert sensor readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Authenticated users can view sensor readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Users can manage their notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can view their notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Farmers can manage their listings" ON public.market_listings;
DROP POLICY IF EXISTS "Anyone can view available listings" ON public.market_listings;
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Managers can update their hubs" ON public.hubs;
DROP POLICY IF EXISTS "Anyone can view hubs" ON public.hubs;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Drop indexes
DROP INDEX IF EXISTS idx_alerts_resolved;
DROP INDEX IF EXISTS idx_alerts_hub_id;
DROP INDEX IF EXISTS idx_sensor_readings_recorded_at;
DROP INDEX IF EXISTS idx_sensor_readings_hub_id;

-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS public.alerts;
DROP TABLE IF EXISTS public.sensor_readings;
DROP TABLE IF EXISTS public.notification_preferences;
DROP TABLE IF EXISTS public.market_listings;
DROP TABLE IF EXISTS public.courses;
DROP TABLE IF EXISTS public.hubs;
DROP TABLE IF EXISTS public.profiles;

-- Drop enum
DROP TYPE IF EXISTS public.user_role;
