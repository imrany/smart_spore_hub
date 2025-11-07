import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { Bell, MessageSquare, Phone } from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadPreferences(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadPreferences = async (userId: string) => {
    const { data } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (data) {
      setSmsEnabled(data.sms_enabled);
      setWhatsappEnabled(data.whatsapp_enabled);
      setPhoneNumber(data.phone_number || "");
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: session.user.id,
          sms_enabled: smsEnabled,
          whatsapp_enabled: whatsappEnabled,
          phone_number: phoneNumber,
        });

      if (error) throw error;
      toast.success("Notification preferences saved!");
    } catch (error: any) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Stay updated with market opportunities and important alerts
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-accent" />
              <div>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications about environmental alerts, new listings, and orders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-accent" />
                  <div>
                    <Label htmlFor="sms" className="text-base font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text messages for urgent updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms"
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-accent" />
                  <div>
                    <Label htmlFor="whatsapp" className="text-base font-medium">
                      WhatsApp Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get updates through WhatsApp
                    </p>
                  </div>
                </div>
                <Switch
                  id="whatsapp"
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Required for SMS and WhatsApp notifications
              </p>
            </div>

            <Button 
              onClick={handleSave} 
              className="w-full" 
              disabled={loading}
              variant="hero"
            >
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Notifications</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>You will receive notifications for:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Environmental alerts when temperature or humidity exceed safe levels</li>
              <li>New market listings matching your interests</li>
              <li>Orders placed on your products (farmers)</li>
              <li>Price changes and special offers</li>
              <li>Hub announcements and updates</li>
              <li>Course availability and reminders</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
