import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthError } from "@supabase/supabase-js";

const AuthPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

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
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto px-8 py-12">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
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
                brand: '#2563eb',
                brandAccent: '#1d4ed8',
              },
            },
          },
        }}
        providers={["google"]}
        redirectTo={`${window.location.origin}/auth/callback`}
        view="sign_in"
      />
    </div>
  );
};

export default AuthPage;