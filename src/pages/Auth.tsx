import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { AuthError } from "@supabase/supabase-js";
import type { ViewType } from "@supabase/auth-ui-shared";

const AuthPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>("sign_up");

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

  const toggleView = () => {
    setView(view === "sign_up" ? "sign_in" : "sign_up");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Column - Hero/Welcome Section */}
      <div className="hidden md:flex md:w-1/2 bg-primary/5 items-center justify-center p-8">
        <div className="max-w-md space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            Welcome to Leena.ai
          </h2>
          <p className="text-lg text-muted-foreground">
            Accurately track your daily nutrition with photos of your food using advanced AI vision technology. Just snap and go.
          </p>
        </div>
      </div>

      {/* Right Column - Auth UI */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">{view === "sign_up" ? "Create Account" : "Welcome Back"}</h2>
            <p className="text-muted-foreground mt-2">
              {view === "sign_up" 
                ? "Get started by creating your account" 
                : "Sign in to your account"}
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

      {/* Logo and Toggle Button positioned absolutely */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Leena.ai</h1>
        <Button
          variant="ghost"
          onClick={toggleView}
          className="text-primary hover:text-primary/80"
        >
          {view === "sign_up" ? "Sign In" : "Sign Up"}
        </Button>
      </div>
    </div>
  );
};

export default AuthPage;