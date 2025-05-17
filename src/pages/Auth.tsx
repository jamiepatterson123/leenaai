
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const toggleAuthView = () => {
    setAuthView(authView === "sign_in" ? "sign_up" : "sign_in");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>;
  }

  return <div className="min-h-screen flex flex-col bg-gray-50 font-poppins">
      {/* Logo Header with Sign Up button */}
      <div className="w-full p-4 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="inline-block">
            <h1 className="text-black font-semibold text-base">Leena.ai</h1>
          </Link>
          
          <Button variant="gradient" size="sm" onClick={toggleAuthView} className="flex items-center gap-2">
            {authView === "sign_in" ? <>
                <UserPlus size={16} />
                <span className="font-semibold">Sign Up</span>
              </> : <>
                <LogIn size={16} />
                <span className="font-semibold">Sign In</span>
              </>}
          </Button>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gradient">
              {authView === "sign_in" ? "Sign In" : "Sign Up"}
            </h1>
            <p className="mt-2 text-gray-600 font-normal">
              {authView === "sign_in" 
                ? "Welcome back to Leena.ai" 
                : "Try tracking your nutrition with photos for free"}
            </p>
          </div>

          <SupabaseAuth 
            supabaseClient={supabase} 
            appearance={{
              theme: ThemeSupa,
              style: {
                button: {
                  background: 'linear-gradient(to right, #D946EF, #8B5CF6)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 500
                },
                anchor: {
                  color: '#D946EF',
                  fontWeight: 600
                },
                message: {
                  fontWeight: 500
                }
              },
              // Custom localization to control the text displayed
              localization: {
                variables: {
                  sign_in: {
                    link_text: "Don't have an account? Sign up"
                  },
                  sign_up: {
                    link_text: "Already have an account? Sign in"
                  }
                }
              }
            }} 
            providers={[]} 
            redirectTo={`${window.location.origin}/auth/callback`} 
            view={authView}
            // Handle view changes when the link is clicked by user
            showLinks={true}
            // Pass a callback that will be called when the view changes
            // This connects the toggle link behavior to our state
            magicLink={false}
          />

          {/* Add custom link handler since onViewChange isn't supported */}
          <div className="mt-4 text-center">
            <button 
              onClick={toggleAuthView}
              className="text-primary font-semibold hover:underline"
            >
              {authView === "sign_in" 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>;
};

export default Auth;
