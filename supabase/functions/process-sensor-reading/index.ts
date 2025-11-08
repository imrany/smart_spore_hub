import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Send email notification via your Go server
async function sendEmailNotification(
  to: string,
  hubName: string,
  alertType: string,
  message: string,
  temperature?: number,
  humidity?: number,
) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .alert-info {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
          }
          .metrics {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
          }
          .metric {
            text-align: center;
            padding: 15px;
            background-color: #f3f4f6;
            border-radius: 5px;
            flex: 1;
            margin: 0 5px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
          }
          .metric-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .action-required {
            background-color: #fef2f2;
            border: 2px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Alert: ${hubName}</h1>
            <p>Environmental Threshold Exceeded</p>
          </div>
          <div class="content">
            <div class="alert-info">
              <strong>Alert Type:</strong> ${alertType.toUpperCase()}<br>
              <strong>Message:</strong> ${message}
            </div>

            ${
              temperature !== undefined || humidity !== undefined
                ? `
              <div class="metrics">
                ${
                  temperature !== undefined
                    ? `
                  <div class="metric">
                    <div class="metric-value">${temperature}°C</div>
                    <div class="metric-label">Temperature</div>
                  </div>
                `
                    : ""
                }
                ${
                  humidity !== undefined
                    ? `
                  <div class="metric">
                    <div class="metric-value">${humidity}%</div>
                    <div class="metric-label">Humidity</div>
                  </div>
                `
                    : ""
                }
              </div>
            `
                : ""
            }

            <div class="action-required">
              <strong>⚠️ Action Required:</strong><br>
              Please check your mushroom growing environment immediately and take corrective action to bring conditions back within safe thresholds.
              <ul>
                <li>Temperature threshold: 24°C</li>
                <li>Humidity threshold: 65%</li>
              </ul>
            </div>

            <p>
              <strong>Time:</strong> ${new Date().toLocaleString()}<br>
              <strong>Hub:</strong> ${hubName}
            </p>

            <p style="margin-top: 30px;">
              Log in to your dashboard to view detailed metrics and manage your alerts.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated alert from Smart Mushroom Hub</p>
            <p>You received this email because you are registered as the manager of ${hubName}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Call your Go server's email endpoint
    const emailApiUrl = Deno.env.get("EMAIL_API_URL");

    const response = await fetch(emailApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject: `🚨 Alert: ${alertType.toUpperCase()} threshold exceeded at ${hubName}`,
        html: htmlContent,
        is_html: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Email API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log("Email notification sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { hub_id, temperature, humidity } = await req.json();

    console.log("Processing sensor reading:", {
      hub_id,
      temperature,
      humidity,
    });

    // Insert sensor reading
    const { data: reading, error: readingError } = await supabase
      .from("sensor_readings")
      .insert({
        hub_id,
        temperature,
        humidity,
      })
      .select()
      .single();

    if (readingError) {
      console.error("Error inserting sensor reading:", readingError);
      throw readingError;
    }

    console.log("Sensor reading inserted:", reading);

    // Check thresholds
    const TEMP_THRESHOLD = 24;
    const HUMIDITY_THRESHOLD = 65;

    const tempExceeded = temperature > TEMP_THRESHOLD;
    const humidityExceeded = humidity > HUMIDITY_THRESHOLD;

    if (tempExceeded || humidityExceeded) {
      console.log("Threshold exceeded, creating alert");

      // Check if there's already an unresolved alert for this hub
      const { data: existingAlerts } = await supabase
        .from("alerts")
        .select("*")
        .eq("hub_id", hub_id)
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(1);

      // Only create alert if no recent unresolved alert exists
      if (!existingAlerts || existingAlerts.length === 0) {
        let alertType: string;
        let message: string;

        if (tempExceeded && humidityExceeded) {
          alertType = "both";
          message = `ALERT: Both temperature (${temperature}°C) and humidity (${humidity}%) have exceeded safe thresholds!`;
        } else if (tempExceeded) {
          alertType = "temperature";
          message = `ALERT: Temperature (${temperature}°C) has exceeded the safe threshold of ${TEMP_THRESHOLD}°C!`;
        } else {
          alertType = "humidity";
          message = `ALERT: Humidity (${humidity}%) has exceeded the safe threshold of ${HUMIDITY_THRESHOLD}%!`;
        }

        const { data: alert, error: alertError } = await supabase
          .from("alerts")
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
          console.error("Error creating alert:", alertError);
        } else {
          console.log("Alert created:", alert);

          // Get hub details and manager contact info
          const { data: hub } = await supabase
            .from("hubs")
            .select("name, manager_id")
            .eq("id", hub_id)
            .single();

          if (hub?.manager_id) {
            // Get manager profile and notification preferences
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", hub.manager_id)
              .single();

            const { data: preferences } = await supabase
              .from("notification_preferences")
              .select("*")
              .eq("user_id", hub.manager_id)
              .single();

            // Send notifications based on preferences
            const notifications: Promise<any>[] = [];

            if (preferences?.email_enabled && profile?.email) {
              console.log("Sending email notification to:", profile.email);
              notifications.push(
                sendEmailNotification(
                  profile.email,
                  hub.name,
                  alertType,
                  message,
                  temperature,
                  humidity,
                ),
              );
            }

            if (preferences?.sms_enabled && preferences?.phone_number) {
              console.log(
                "Would send SMS notification to:",
                preferences.phone_number,
              );
              // TODO: Integrate with SMS service (Twilio, Africa's Talking, etc.)
            }

            if (preferences?.whatsapp_enabled && preferences?.phone_number) {
              console.log(
                "Would send WhatsApp notification to:",
                preferences.phone_number,
              );
              // TODO: Integrate with WhatsApp service
            }

            // Wait for all notifications to complete
            if (notifications.length > 0) {
              await Promise.allSettled(notifications);
            }
          }
        }
      } else {
        console.log("Unresolved alert already exists, skipping alert creation");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reading,
        alert_triggered: tempExceeded || humidityExceeded,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error processing sensor reading:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
