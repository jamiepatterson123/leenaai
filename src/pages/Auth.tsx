import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthLoading } from "@/components/auth/AuthLoading";
import type { AuthError } from "@supabase/supabase-js";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Auth component mounted");
    let mounted = true;

    const handleSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setError(sessionError.message);
          }
        } else if (session && mounted) {
          console.log("Valid session found, redirecting to home");
          navigate("/");
        }
      } catch (err) {
        console.error("Auth error:", err);
        if (mounted) {
          setError("Authentication error occurred");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize session check
    handleSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN') {
        console.log("User signed in, redirecting to home");
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        setError("");
      } else if (event === 'USER_UPDATED') {
        if (!session) {
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.error("Session error after update:", sessionError);
            setError(sessionError.message);
          }
        }
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <AuthLoading />;
  }

  return (
    <div className="flex min-h-screen">
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
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">Sign In</h2>
            <p className="text-muted-foreground mt-2">
              Get started by signing in to your account
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Auth
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
            providers={["google"]}
            redirectTo="https://tehosjvonqxuiziqjlry.supabase.co/auth/v1/callback"
            view="sign_in"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;