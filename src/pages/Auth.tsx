import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthError } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

const AuthPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_in");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate("/");
        }
        if (event === 'SIGNED_OUT') {
          setError("");
        }
        if (event === 'USER_UPDATED' && !session) {
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            setError(sessionError.message);
          }
        }
      }
    );

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session) {
        navigate("/");
      }
      if (error) {
        setError(error.message);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Toggle Button - Positioned absolutely at the top right */}
      <Button
        onClick={() => setView(view === "sign_in" ? "sign_up" : "sign_in")}
        className="absolute top-4 right-4 z-10 bg-white text-primary border-primary hover:bg-primary/5"
        variant="outline"
      >
        {view === "sign_in" ? "Sign Up" : "Sign In"}
      </Button>

      {/* Left Column - Hero/Welcome Section */}
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

      {/* Right Column - Auth UI */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-2xl font-bold">
              {view === "sign_in" ? "Sign In" : "Sign Up"}
            </h2>
            <p className="text-muted-foreground">
              {view === "sign_in" 
                ? "Sign in to your account to continue"
                : "Create an account to get started"}
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
            redirectTo={`${window.location.origin}/welcome/callback`}
            view={view}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;