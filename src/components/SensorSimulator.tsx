import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Activity } from "lucide-react";
import { SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";

interface Props {
  hubId: string;
}

export const SensorSimulator = ({ hubId }: Props) => {
  const [temperature, setTemperature] = useState("22.5");
  const [humidity, setHumidity] = useState("60");
  const [sending, setSending] = useState(false);

  const sendReading = async () => {
    setSending(true);
    try {
      const response = await fetch(
        // "https://hhaufizlhagxkprrczil.supabase.co/functions/v1/process-sensor-reading",
        "https://hcqxxoyhnmzpuqulcgjv.supabase.co/functions/v1/process-sensor-reading",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hub_id: hubId,
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success(
          result.alert_triggered
            ? "Reading sent - Alert triggered!"
            : "Reading sent successfully",
        );
      } else {
        toast.error(result.error);
        console.error(result.error);
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        console.error("Error sending reading:", error);
        toast.error("Failed to send reading");
      }
    } finally {
      setSending(false);
    }
  };

  const sendRandomReading = () => {
    const randomTemp = (20 + Math.random() * 8).toFixed(1);
    const randomHumidity = (55 + Math.random() * 20).toFixed(1);
    setTemperature(randomTemp);
    setHumidity(randomHumidity);
    setTimeout(() => sendReading(), 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          <CardTitle className="text-base">Sensor Simulator</CardTitle>
        </div>
        <CardDescription>
          Send simulated sensor readings (for testing)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="temp">Temperature (°C)</Label>
            <Input
              id="temp"
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="humidity">Humidity (%)</Label>
            <Input
              id="humidity"
              type="number"
              step="0.1"
              value={humidity}
              onChange={(e) => setHumidity(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendReading} disabled={sending} className="flex-1">
            {sending ? "Sending..." : "Send Reading"}
          </Button>
          <Button
            onClick={sendRandomReading}
            variant="outline"
            disabled={sending}
          >
            Random
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Thresholds: Temp &gt; 24°C, Humidity &gt; 65%
        </p>
      </CardContent>
    </Card>
  );
};
