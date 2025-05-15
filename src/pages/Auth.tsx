
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/utils/metaPixel";
import type { AuthChangeEvent } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle auth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Get URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        
        if (accessToken && refreshToken) {
          // Set session with tokens from URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) throw sessionError;
          navigate("/dashboard");
        }
      } catch (e) {
        console.error("Auth callback error:", e);
        setError("Failed to complete authentication. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    if (window.location.pathname === "/auth/callback") {
      handleAuthCallback();
    } else {
      // Check if user is already logged in
      const checkAuth = async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            navigate("/dashboard");
          }
        } catch (e) {
          console.error("Session check error:", e);
          setError("Failed to check authentication status. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      checkAuth();
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        // Track signup events
        if (event === "SIGNED_UP") {
          console.log("User signed up, tracking in Meta Pixel");
          trackEvent('CompleteRegistration', {
            content_name: 'free_trial',
            status: true
          });
        }
        
        if (session) {
          navigate("/dashboard");
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return <AuthLoading />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Leena.ai</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your AI Nutrition Coach
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </div>
        
        <div className="text-center">
          <Button variant="link" className="text-sm" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
