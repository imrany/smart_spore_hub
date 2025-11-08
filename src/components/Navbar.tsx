import { Link, useNavigate, useRoutes } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import mushroomLogo from "@/assets/mushroom-logo.png";
import { Profile, Session } from "@/types";
import { useFetch } from "@/hooks/use-fetch";

export const Navbar = () => {
  const navigate = useNavigate();
  const { fetchData, loading } = useFetch<Profile>();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      setSession(JSON.parse(session));
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem("session");
    navigate("/");
  };

  const appRoutes = [
    {
      label: "Dashboard",
      path: "/dashboard",
      requiresAuth: session,
    },
    {
      label: "Learning",
      path: "/learning",
      requiresAuth: session,
    },
    {
      label: "Hubs",
      path: "/hubs",
      requiresAuth: session,
    },
    {
      label: "Notifications",
      path: "/notifications",
      requiresAuth: session,
    },
    {
      label: "Logout",
      path: "/logout",
      requiresAuth: session,
      onClick: handleLogout,
    },
    {
      label: "Login",
      path: "/auth",
      requiresAuth: !session,
    },
    {
      label: "Get Started",
      path: "/auth",
      requiresAuth: !session,
    },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={mushroomLogo} alt="Mushroom" className="w-8 h-8" />
            <span className="text-xl font-bold text-primary">
              Smart Mushroom
            </span>
          </Link>

          {session ? (
            <div className="flex items-center gap-4">
              {appRoutes
                .filter((route) => route.requiresAuth)
                .map((route) => (
                  <Link key={route.label} to={route.path}>
                    <Button
                      variant={
                        route.label === "Logout"
                          ? "outline"
                          : window.location.pathname === route.path
                            ? "hero"
                            : "ghost"
                      }
                      className={`${
                        window.location.pathname === route.path
                          ? "variant-hero"
                          : ""
                      }`}
                      onClick={() => {
                        if (route.label === "Logout") {
                          handleLogout();
                        }
                      }}
                    >
                      {route.label === "Logout" && (
                        <LogOut className="w-4 h-4 mr-2" />
                      )}
                      {route.label}
                    </Button>
                  </Link>
                ))}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {appRoutes
                .filter((route) => !route.requiresAuth)
                .map((route) => (
                  <Link key={route.label} to={route.path}>
                    <Button
                      variant={route.label === "Login" ? "ghost" : "hero"}
                      className="active:variant-hero"
                    >
                      {route.label}
                    </Button>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
