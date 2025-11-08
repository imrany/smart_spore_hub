import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Sprout, Mail, CheckCircle2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"farmer" | "buyer">("farmer");
  const [location, setLocation] = useState("");

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      setSession(session);

      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }

      // Handle email verification
      if (event === "USER_UPDATED") {
        const user = session?.user;
        if (user?.email_confirmed_at) {
          toast.success("Email verified successfully!");
          navigate("/dashboard");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // Check if email is not confirmed
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before logging in");
          setShowEmailVerification(true);
          setVerificationEmail(loginEmail);
          return;
        }
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.error("Please verify your email before logging in");
        setShowEmailVerification(true);
        setVerificationEmail(loginEmail);
        return;
      }

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to login");
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password strength
      if (signupPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      const redirectUrl = `${window.location.origin}/auth?verified=true`;

      // Sign up user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: signupEmail,
          password: signupPassword,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              role: role,
            },
          },
        },
      );

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: fullName,
          email: signupEmail,
          phone: phone || null,
          role: role,
          location: location || null,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't throw - user is created, profile can be created later
        }

        // Show verification message
        setShowEmailVerification(true);
        setVerificationEmail(signupEmail);

        toast.success(
          "Account created! Please check your email to verify your account.",
          { duration: 6000 },
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create account");
      } else {
        console.error(error);
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: verificationEmail,
      });

      if (error) throw error;

      toast.success("Verification email resent! Please check your inbox.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to resend verification email");
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="w-16 h-16 text-accent" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Verification Email Sent</AlertTitle>
              <AlertDescription>
                We've sent a verification email to{" "}
                <strong>{verificationEmail}</strong>. Please click the link in
                the email to verify your account.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 Check your inbox (and spam folder)</p>
              <p>🔗 Click the verification link</p>
              <p>✅ You'll be redirected to login</p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleResendVerification}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Resend Verification Email"}
              </Button>

              <Button
                onClick={() => {
                  setShowEmailVerification(false);
                  setVerificationEmail("");
                }}
                variant="ghost"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Sprout className="w-12 h-12 text-accent" />
          </div>
          <CardTitle className="text-2xl">Smart Mushroom App</CardTitle>
          <CardDescription>Join our farming community</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select
                    value={role}
                    onValueChange={(value: "farmer" | "buyer") =>
                      setRole(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Nairobi, Kenya"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
