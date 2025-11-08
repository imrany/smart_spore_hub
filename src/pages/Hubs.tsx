import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Session } from "@supabase/supabase-js";
import { Building2, MapPin, Phone, Plus } from "lucide-react";

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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadHubs();
        loadUserProfile(session.user.id);
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

  const loadUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error loading user profile:", error);
    } else {
      setUserRole(data?.role || null);
    }
  };

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
      description:
        "Main collection and distribution center serving the central region.",
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
          <h1 className="text-4xl font-bold text-primary mb-4">
            Hub Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with local mushroom farming hubs for support, resources, and
            market access.
          </p>
          {(userRole === "farmer" || userRole === "admin") && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="text-white font-bold mt-4">
                  <Plus className="mr-2 inline-block" />
                  Create New Hub
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Hub</DialogTitle>
                  <DialogDescription>
                    Fill in the information below to create a new hub.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contact_phone" className="text-right">
                      Contact Phone
                    </Label>
                    <Input
                      id="contact_phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleSubmit}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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
                  <span className="text-sm font-medium">
                    {hub.contact_phone}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  async function handleSubmit() {
    const { data, error } = await supabase.from("hubs").insert([
      {
        name: name,
        location: location,
        description: description,
        contact_phone: contactPhone,
        manager_id: session.user.id,
      },
    ]);

    if (error) {
      console.error("Error creating hub:", error);
    } else {
      console.log("Hub created successfully:", data);
      setOpen(false);
      loadHubs();
    }
  }
};

export default Hubs;
