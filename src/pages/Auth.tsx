import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const AuthPage = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event);
        if (event === 'SIGNED_IN' && session) {
          navigate("/");
        } else if (event === 'USER_UPDATED') {
          const { error } = await supabase.auth.getSession();
          if (error) {
            setErrorMessage(getErrorMessage(error));
          }
        } else if (event === 'SIGNED_OUT') {
          setErrorMessage(""); // Clear errors on sign out
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Auth error:", error);
    
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          return 'Invalid credentials or email not confirmed.';
        case 422:
          return 'Email already registered or invalid email format.';
        case 401:
          return 'Invalid credentials.';
        default:
          return `Authentication error: ${error.message}`;
      }
    }
    return error.message;
  };

  return (
    <div className="max-w-md mx-auto px-8 py-12">
      <h1 className="text-2xl font-bold text-center mb-8">Sign In</h1>
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        redirectTo={window.location.origin}
        onError={(error) => {
          console.error("Auth UI error:", error);
          setErrorMessage(getErrorMessage(error));
        }}
      />
    </div>
  );
};

export default AuthPage;