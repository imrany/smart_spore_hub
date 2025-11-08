import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Thermometer, Droplets } from "lucide-react";

interface SensorReading {
  id: string;
  temperature: number;
  humidity: number;
  recorded_at: string;
}

interface Alert {
  id: string;
  alert_type: string;
  message: string;
  temperature: number;
  humidity: number;
  resolved: boolean;
  created_at: string;
}

interface Props {
  hubId: string;
}

export const EnvironmentalMonitor = ({ hubId }: Props) => {
  const [latestReading, setLatestReading] = useState<SensorReading | null>(
    null,
  );
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    // Subscribe to real-time sensor readings
    const readingsChannel = supabase
      .channel("sensor-readings-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_readings",
          filter: `hub_id=eq.${hubId}`,
        },
        (payload) => {
          console.log("New sensor reading:", payload);
          setLatestReading(payload.new as SensorReading);
        },
      )
      .subscribe();

    // Subscribe to real-time alerts
    const alertsChannel = supabase
      .channel("alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `hub_id=eq.${hubId}`,
        },
        (payload) => {
          console.log("Alert update:", payload);
          loadAlerts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(readingsChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [hubId]);

  const loadData = async () => {
    await Promise.all([loadLatestReading(), loadAlerts()]);
    setLoading(false);
  };

  const loadLatestReading = async () => {
    const { data, error } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("hub_id", hubId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setLatestReading(data);
    }
  };

  const loadAlerts = async () => {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("hub_id", hubId)
      .eq("resolved", false)
      .order("created_at", { ascending: false });

    setAlerts(data || []);
  };

  const getStatusColor = (
    value: number,
    threshold: number,
    isTemp: boolean,
  ) => {
    if (value > threshold) return "text-destructive";
    if (value > threshold * 0.9) return "text-yellow-600";
    return "text-accent";
  };

  if (loading) {
    return (
      <div className="text-center py-4">Loading environmental data...</div>
    );
  }

  const TEMP_THRESHOLD = 24;
  const HUMIDITY_THRESHOLD = 65;

  return (
    <div className="space-y-4">
      {/* Current Readings */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Temperature</CardTitle>
            <Thermometer className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestReading ? (
              <>
                <div
                  className={`text-3xl font-bold ${getStatusColor(latestReading.temperature, TEMP_THRESHOLD, true)}`}
                >
                  {latestReading.temperature}°C
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Threshold: {TEMP_THRESHOLD}°C
                </p>
                {latestReading.temperature > TEMP_THRESHOLD && (
                  <Badge variant="destructive" className="mt-2">
                    Above Safe Level
                  </Badge>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Humidity</CardTitle>
            <Droplets className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestReading ? (
              <>
                <div
                  className={`text-3xl font-bold ${getStatusColor(latestReading.humidity, HUMIDITY_THRESHOLD, false)}`}
                >
                  {latestReading.humidity}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Threshold: {HUMIDITY_THRESHOLD}%
                </p>
                {latestReading.humidity > HUMIDITY_THRESHOLD && (
                  <Badge variant="destructive" className="mt-2">
                    Above Safe Level
                  </Badge>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-base">Active Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-destructive/10 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {alert.alert_type.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {latestReading && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(latestReading.recorded_at).toLocaleString()}
        </p>
      )}
    </div>
  );
};
