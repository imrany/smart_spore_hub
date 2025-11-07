import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { hub_id, temperature, humidity } = await req.json();

    console.log('Processing sensor reading:', { hub_id, temperature, humidity });

    // Insert sensor reading
    const { data: reading, error: readingError } = await supabase
      .from('sensor_readings')
      .insert({
        hub_id,
        temperature,
        humidity,
      })
      .select()
      .single();

    if (readingError) {
      console.error('Error inserting sensor reading:', readingError);
      throw readingError;
    }

    console.log('Sensor reading inserted:', reading);

    // Check thresholds
    const TEMP_THRESHOLD = 24;
    const HUMIDITY_THRESHOLD = 65;

    const tempExceeded = temperature > TEMP_THRESHOLD;
    const humidityExceeded = humidity > HUMIDITY_THRESHOLD;

    if (tempExceeded || humidityExceeded) {
      console.log('Threshold exceeded, creating alert');

      // Check if there's already an unresolved alert for this hub
      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('hub_id', hub_id)
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(1);

      // Only create alert if no recent unresolved alert exists
      if (!existingAlerts || existingAlerts.length === 0) {
        let alertType: string;
        let message: string;

        if (tempExceeded && humidityExceeded) {
          alertType = 'both';
          message = `ALERT: Both temperature (${temperature}°C) and humidity (${humidity}%) have exceeded safe thresholds!`;
        } else if (tempExceeded) {
          alertType = 'temperature';
          message = `ALERT: Temperature (${temperature}°C) has exceeded the safe threshold of ${TEMP_THRESHOLD}°C!`;
        } else {
          alertType = 'humidity';
          message = `ALERT: Humidity (${humidity}%) has exceeded the safe threshold of ${HUMIDITY_THRESHOLD}%!`;
        }

        const { data: alert, error: alertError } = await supabase
          .from('alerts')
          .insert({
            hub_id,
            alert_type: alertType,
            message,
            temperature,
            humidity,
          })
          .select()
          .single();

        if (alertError) {
          console.error('Error creating alert:', alertError);
        } else {
          console.log('Alert created:', alert);

          // Get hub details and farmer contact info
          const { data: hub } = await supabase
            .from('hubs')
            .select('name, manager_id')
            .eq('id', hub_id)
            .single();

          if (hub?.manager_id) {
            const { data: preferences } = await supabase
              .from('notification_preferences')
              .select('*')
              .eq('user_id', hub.manager_id)
              .single();

            if (preferences && (preferences.sms_enabled || preferences.whatsapp_enabled)) {
              console.log('Would send notification to:', preferences.phone_number);
              // TODO: Integrate with SMS/WhatsApp service (Twilio, etc.)
              // This is where you'd send the actual notification
            }
          }
        }
      } else {
        console.log('Unresolved alert already exists, skipping alert creation');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reading,
        alert_triggered: tempExceeded || humidityExceeded 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing sensor reading:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
