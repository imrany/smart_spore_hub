import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell, Mail, MessageSquare, Phone } from "lucide-react";
import { Profile, Session } from "@/types";
import { useFetch } from "@/hooks/use-fetch";

const Notifications = () => {
  const navigate = useNavigate();
  const parsedSession = JSON.parse(localStorage.getItem("session")) as Session;
  const { fetchData, loading } = useFetch<Profile>();
  const [session, setSession] = useState<Session | null>(parsedSession);

  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!session) {
      navigate("/auth");
    } else {
      setSession(parsedSession);
      loadPreferences(parsedSession.id);
    }
  }, [session]);

  const loadPreferences = async (userId: string) => {
    const { data, error } = await fetchData(
      `/api/v1/notification/preferences/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      },
    );

    if (error) {
      toast.error("Failed to load notification preferences");
      return;
    }

    if (data) {
      setSmsEnabled(data.sms_enabled);
      setEmailEnabled(data.email_enabled);
      setWhatsappEnabled(data.whatsapp_enabled);
      setPhoneNumber(data.phone_number || "");
    }
  };

  const handleSave = async () => {
    if (!session) return;

    try {
      const { data, error } = await fetchData(
        `/api/v1/notification/preferences/${session.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
          body: JSON.stringify({
            sms_enabled: smsEnabled,
            whatsapp_enabled: whatsappEnabled,
            phone_number: phoneNumber,
            email_enabled: emailEnabled,
          }),
        },
      );

      if (error) {
        toast.error(`Failed to save preferences: ${error.message}`);
      } else {
        toast.success("Notification preferences saved!");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to save preferences: ${error.message}`);
      } else {
        toast.error("Failed to save preferences");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Notification Settings
          </h1>
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
                  Choose how you want to receive notifications about
                  environmental alerts, new listings, and orders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-accent" />
                  <div>
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for urgent updates
                    </p>
                  </div>
                </div>
                <Switch
                  id="email"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              {/*<div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
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
              </div>*/}

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
                {/*Required for SMS and WhatsApp notifications*/}
                Required for WhatsApp notifications
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
              <li>
                Environmental alerts when temperature or humidity exceed safe
                levels
              </li>
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
