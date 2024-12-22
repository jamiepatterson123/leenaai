import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Check for password reset confirmation
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    const error = hashParams.get("error");
    const error_description = hashParams.get("error_description");

    if (error) {
      toast({
        title: "Authentication Error",
        description: error_description || "An error occurred during authentication",
        variant: "destructive",
      });
    }

    if (type === "recovery") {
      toast({
        title: "Password Reset",
        description: "Please enter your new password",
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-center mb-8 text-primary">Welcome to Focused Nutrition</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    brandButtonText: 'white',
                  },
                  borderWidths: {
                    inputBorderWidth: '1px',
                    buttonBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full bg-primary hover:bg-primary/90',
                anchor: 'text-primary hover:text-primary/80',
                divider: 'bg-border',
                label: 'text-foreground',
                input: 'bg-background border-input',
              },
            }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/auth`}
            onlyThirdPartyProviders={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;