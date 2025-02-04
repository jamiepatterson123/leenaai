import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Auth component mounted");
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, "Session:", session);
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, redirecting to home");
          navigate("/profile");
        }
        if (event === 'SIGNED_OUT') {
          setError("");
        }
        if (event === 'USER_UPDATED' && !session) {
          try {
            const { error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
              setError(sessionError.message);
            }
          } catch (e) {
            console.error("Session check error:", e);
            setError("Failed to check authentication status. Please try again.");
          }
        }
      }
    );

    // Check current session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Initial session check:", session, "Error:", error);
        
        if (mounted) {
          if (session) {
            navigate("/");
          }
          if (error) {
            setError(error.message);
          }
          setLoading(false);
        }
      } catch (e) {
        console.error("Initial session check error:", e);
        if (mounted) {
          setError("Failed to check authentication status. Please try again.");
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen relative">
      <Button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 z-10 bg-white text-primary border-primary hover:bg-primary/5"
        variant="outline"
      >
        Sign Up
      </Button>

      <div className="hidden md:flex md:w-1/2 bg-primary/5 items-center justify-center p-8">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Leena.ai
          </h1>
          <p className="text-lg text-muted-foreground">
            Accurately track your daily nutrition with photos of your food using advanced AI vision technology. Just snap and go.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-2xl font-bold">Sign In</h2>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(142.1 70.6% 45.3%)',
                    brandAccent: 'hsl(142.1 76% 36.3%)',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full',
                anchor: 'text-primary hover:text-primary/80',
              }
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/auth/callback`}
            view="sign_in"
            showLinks={false}
          />

          <div className="mt-8 p-6 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-center font-medium">"Like having a nutritionist in my pocket! Love it!"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;