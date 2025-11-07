-- Create sensor readings table
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE NOT NULL,
  temperature DECIMAL(5,2) NOT NULL,
  humidity DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_sensor_readings_hub_id ON public.sensor_readings(hub_id);
CREATE INDEX idx_sensor_readings_recorded_at ON public.sensor_readings(recorded_at DESC);

-- Enable RLS
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view sensor readings
CREATE POLICY "Authenticated users can view sensor readings"
  ON public.sensor_readings FOR SELECT
  TO authenticated
  USING (true);

-- Only system can insert readings (will be done via edge function)
CREATE POLICY "Service role can insert sensor readings"
  ON public.sensor_readings FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('temperature', 'humidity', 'both')),
  message TEXT NOT NULL,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_alerts_hub_id ON public.alerts(hub_id);
CREATE INDEX idx_alerts_resolved ON public.alerts(resolved);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view alerts
CREATE POLICY "Authenticated users can view alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (true);

-- Users can resolve alerts
CREATE POLICY "Authenticated users can update alerts"
  ON public.alerts FOR UPDATE
  TO authenticated
  USING (true);

-- Enable realtime for sensor readings
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- Set replica identity for realtime updates
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;