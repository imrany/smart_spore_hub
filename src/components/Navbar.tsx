import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import mushroomLogo from "@/assets/mushroom-logo.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={mushroomLogo} alt="Mushroom" className="w-8 h-8" />
            <span className="text-xl font-bold text-primary">Smart Mushroom</span>
          </Link>
          
          {session ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/learning">
                <Button variant="ghost">Learning</Button>
              </Link>
              <Link to="/hubs">
                <Button variant="ghost">Hubs</Button>
              </Link>
              <Link to="/notifications">
                <Button variant="ghost">Notifications</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
