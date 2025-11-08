import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import mushroomLogo from "@/assets/mushroom-logo.png";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Navbar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    console.log("handleLogout called");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during logout:", error);
        return;
      }
      setIsMenuOpen(false); // Close menu after logout
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleNavigate = () => {
    setIsMenuOpen(false); // Close menu after navigation
  };

  const authenticatedRoutes = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Learning",
      path: "/learning",
    },
    {
      label: "Hubs",
      path: "/hubs",
    },
    {
      label: "Notifications",
      path: "/notifications",
    },
  ];

  const unauthenticatedRoutes = [
    {
      label: "Login",
      path: "/auth",
    },
    {
      label: "Get Started",
      path: "/auth",
    },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={mushroomLogo} alt="Mushroom" className="w-8 h-8" />
            <span className="text-xl font-bold text-primary">
              Smart Mushroom
            </span>
          </Link>

          {/* Desktop Navigation */}
          {session ? (
            <div className="hidden md:flex items-center gap-4">
              {authenticatedRoutes.map((route) => (
                <Link key={route.label} to={route.path}>
                  <Button
                    variant={
                      window.location.pathname === route.path ? "hero" : "ghost"
                    }
                  >
                    {route.label}
                  </Button>
                </Link>
              ))}

              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              {unauthenticatedRoutes.map((route) => (
                <Link key={route.label} to={route.path}>
                  <Button variant={route.label === "Login" ? "ghost" : "hero"}>
                    {route.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Hamburger Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden p-0">
                <Menu className="w-8 h-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navigate through the app</SheetDescription>
              </SheetHeader>

              {session ? (
                <div className="flex flex-col gap-4 mt-6">
                  {authenticatedRoutes.map((route) => (
                    <Link
                      key={route.label}
                      to={route.path}
                      onClick={handleNavigate}
                      className="w-full"
                    >
                      <Button
                        variant={
                          window.location.pathname === route.path
                            ? "hero"
                            : "ghost"
                        }
                        className="w-full justify-start"
                      >
                        {route.label}
                      </Button>
                    </Link>
                  ))}

                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 mt-6">
                  {unauthenticatedRoutes.map((route) => (
                    <Link
                      key={route.label}
                      to={route.path}
                      onClick={handleNavigate}
                      className="w-full"
                    >
                      <Button
                        variant={route.label === "Login" ? "ghost" : "hero"}
                        className="w-full"
                      >
                        {route.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
