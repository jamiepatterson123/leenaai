
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import { Testimonial } from "@/components/ui/testimonial";

const Auth = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">("sign_in");
  
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      if (event === "SIGNED_IN") {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background font-poppins">
      {/* Logo Header */}
      <div className="w-full py-4 px-6 md:px-12">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            Leena.ai
          </Link>
          <Link to="/auth">
            <Button variant="outline">Sign in</Button>
          </Link>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        {/* Hero section with gradient text */}
        <div className="w-full max-w-4xl text-center mb-12">
          <div className="mb-4">
            <Button variant="secondary" size="sm" className="gap-2">
              AI-Powered Food Tracking <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
            <span className="text-gradient bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] text-transparent bg-clip-text">Track your nutrition</span>
            <br />
            <span className="text-black">accurately</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            With just photos of your food
          </p>
        </div>

        {/* Auth UI */}
        <div className="w-full max-w-md mb-10">
          <Button 
            variant="gradient" 
            size="lg"
            onClick={() => setAuthView("sign_up")}
            className="w-full mb-8"
          >
            Start free <MoveRight className="w-4 h-4" />
          </Button>
          
          <SupabaseAuth 
            supabaseClient={supabase} 
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8B5CF6',
                    brandAccent: '#D946EF',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.5rem',
                    buttonBorderRadius: '0.5rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
            }}
            providers={[]} 
            redirectTo={`${window.location.origin}/auth/callback`}
            view={authView}
          />
        </div>
        
        {/* Testimonial */}
        <div className="mt-4">
          <Testimonial />
        </div>
      </div>
    </div>
  );
};

export default Auth;
