import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Session } from "@supabase/supabase-js";
import { Building2, MapPin, Phone } from "lucide-react";

interface Hub {
  id: string;
  name: string;
  location: string;
  description: string;
  contact_phone: string;
}

const Hubs = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [hubs, setHubs] = useState<Hub[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadHubs();
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

  const loadHubs = async () => {
    const { data } = await supabase
      .from("hubs")
      .select("*")
      .order("created_at", { ascending: false });

    setHubs(data || mockHubs);
  };

  // Mock hub data for demonstration
  const mockHubs: Hub[] = [
    {
      id: "1",
      name: "Central Valley Hub",
      location: "123 Farm Road, Central Valley",
      description: "Main collection and distribution center serving the central region.",
      contact_phone: "+1234567890",
    },
    {
      id: "2",
      name: "Northern Region Hub",
      location: "456 Agriculture Lane, Northern District",
      description: "Hub specializing in oyster mushroom distribution.",
      contact_phone: "+1234567891",
    },
    {
      id: "3",
      name: "Southern Cooperative Hub",
      location: "789 Harvest Street, Southern Area",
      description: "Farmer cooperative hub with storage facilities.",
      contact_phone: "+1234567892",
    },
  ];

  const displayHubs = hubs.length > 0 ? hubs : mockHubs;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Hub Management</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with local mushroom farming hubs for support, resources, and market access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayHubs.map((hub) => (
            <Card key={hub.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Building2 className="w-10 h-10 text-accent flex-shrink-0" />
                  <div>
                    <CardTitle>{hub.name}</CardTitle>
                    <CardDescription>{hub.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{hub.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium">{hub.contact_phone}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hubs;
