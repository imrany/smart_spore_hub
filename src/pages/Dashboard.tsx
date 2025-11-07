import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { EnvironmentalMonitor } from "@/components/EnvironmentalMonitor";
import { SensorSimulator } from "@/components/SensorSimulator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { Plus, ShoppingBag } from "lucide-react";

interface Listing {
  id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  available: boolean;
}

interface Profile {
  role: string;
}

interface Hub {
  id: string;
  name: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadProfile(session.user.id);
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

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    
    setProfile(data);
    loadListings();
    loadHubs();
  };

  const loadHubs = async () => {
    const { data } = await supabase
      .from("hubs")
      .select("id, name")
      .order("name");
    
    if (data && data.length > 0) {
      setHubs(data);
      setSelectedHubId(data[0].id);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("market_listings")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load listings");
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const { error } = await supabase
      .from("market_listings")
      .insert({
        farmer_id: session.user.id,
        product_name: productName,
        description,
        quantity: parseFloat(quantity),
        unit,
        price_per_unit: parseFloat(price),
      });

    if (error) {
      toast.error("Failed to create listing");
    } else {
      toast.success("Listing created successfully!");
      setDialogOpen(false);
      // Reset form
      setProductName("");
      setDescription("");
      setQuantity("");
      setPrice("");
      loadListings();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Environmental Monitoring Section */}
        {selectedHubId && (
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-primary mb-2">Environmental Monitoring</h2>
              <p className="text-muted-foreground">
                Real-time temperature and humidity tracking for {hubs.find(h => h.id === selectedHubId)?.name || 'hub'}
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EnvironmentalMonitor hubId={selectedHubId} />
              </div>
              <div>
                <SensorSimulator hubId={selectedHubId} />
              </div>
            </div>
          </div>
        )}

        {/* Market Dashboard Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Market Dashboard</h1>
            <p className="text-muted-foreground">
              {profile?.role === "farmer" 
                ? "Manage your listings and connect with buyers" 
                : "Browse fresh mushroom products from local farmers"}
            </p>
          </div>
          
          {profile?.role === "farmer" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Listing</DialogTitle>
                  <DialogDescription>
                    Add your mushroom products to the marketplace
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateListing} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product Name</Label>
                    <Input
                      id="product"
                      placeholder="e.g., Oyster Mushrooms"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your product..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="kg, lbs, etc."
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Unit ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Listing
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No listings available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{listing.product_name}</CardTitle>
                  <CardDescription>{listing.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-semibold">{listing.quantity} {listing.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-accent">${listing.price_per_unit}/{listing.unit}</span>
                    </div>
                    {profile?.role === "buyer" && (
                      <Button className="w-full mt-4" variant="hero">
                        Contact Farmer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
