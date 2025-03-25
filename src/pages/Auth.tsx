
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"sign_in" | "sign_up" | "forgotten_password" | "update_password">("sign_in");

  useEffect(() => {
    let mounted = true;

    // Check if we're in a password reset flow
    const access_token = searchParams.get("access_token");
    const type = searchParams.get("type");
    
    console.log("URL params:", { type, access_token });

    if (type === "recovery" || type === "signup") {
      setView("update_password");
      console.log("Setting view to update_password");
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, "Session:", session);
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, redirecting to profile");
          navigate("/profile");
        }
        if (event === 'SIGNED_OUT') {
          setError("");
        }
        if (event === 'PASSWORD_RECOVERY') {
          console.log("Password recovery event received");
          setView("update_password");
        }
        if (event === 'USER_UPDATED') {
          console.log("User updated event received");
          try {
            const { error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
              setError(sessionError.message);
            } else {
              // Successfully updated password
              navigate("/profile");
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
            navigate("/profile");
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
  }, [navigate, searchParams]);

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
        Back Home
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
            <h2 className="text-2xl font-bold">
              {view === "sign_in" ? "Sign In" : ""}
              {view === "sign_up" ? "Sign Up" : ""}
              {view === "forgotten_password" ? "Reset Password" : ""}
              {view === "update_password" ? "Update Password" : ""}
            </h2>
            <p className="text-muted-foreground">
              {view === "sign_in" && "Sign in to your account to continue"}
              {view === "sign_up" && "Create a free account to get started"}
              {view === "forgotten_password" && "Enter your email to reset your password"}
              {view === "update_password" && "Enter your new password"}
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
            redirectTo={`${window.location.origin}/auth`}
            view={view}
            showLinks={true}
            localization={{
              variables: {
                sign_up: {
                  link_text: "Don't have an account? Sign up"
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
