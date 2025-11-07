import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ShoppingCart, GraduationCap, Building2, Bell } from "lucide-react";
import heroImage from "@/assets/mushroom-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Fresh mushrooms growing" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-primary">
              Smart Mushroom Farming
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connecting farmers and buyers through technology. Learn, grow, and trade mushrooms with confidence.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="hero" className="text-lg px-8">
                  Join as Farmer
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Join as Buyer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            Everything You Need to Succeed
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow bg-card">
              <ShoppingCart className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Market Linkage</h3>
              <p className="text-muted-foreground">
                Connect directly with buyers and sell your mushroom harvest at fair prices.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow bg-card">
              <GraduationCap className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">E-Learning</h3>
              <p className="text-muted-foreground">
                Access comprehensive courses on mushroom cultivation and best practices.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow bg-card">
              <Building2 className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hub Management</h3>
              <p className="text-muted-foreground">
                Manage your farming hub with ease and coordinate with other farmers.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow bg-card">
              <Bell className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Notifications</h3>
              <p className="text-muted-foreground">
                Stay updated with SMS and WhatsApp alerts for environmental conditions, orders, and opportunities.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-primary">
              Ready to Transform Your Mushroom Business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of farmers and buyers already using Smart Mushroom to grow their business.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="hero" className="text-lg px-12">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
