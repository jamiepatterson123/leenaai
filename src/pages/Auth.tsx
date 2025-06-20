
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { triggerSignUpConfetti } from "@/utils/confetti";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<"sign_in" | "sign_up" | "forgotten_password">("sign_in");
  const [email, setEmail] = useState<string>("");
  const [resetLoading, setResetLoading] = useState(false);
  
  useEffect(() => {
    // Check if we have an initialView in the location state
    const initialView = location.state?.initialView;
    if (initialView === "sign_up") {
      setAuthView("sign_up");
    }

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
    } = supabase.auth.onAuthStateChange((event: any, session: Session | null) => {
      console.log("Auth state changed:", event);
      
      if (event === "SIGNED_IN") {
        setSession(session);
        navigate("/dashboard");
      } else if (event === "SIGNED_OUT") {
        setSession(null);
      } 
      
      // Handle USER_CREATED event (which is not in the TypeScript definition)
      // but is actually emitted by Supabase
      if (event === "USER_CREATED") {
        triggerSignUpConfetti();
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate, location.state]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (session) {
      navigate("/dashboard");
    }
  }, [session, navigate]);
  
  const toggleAuthView = () => {
    setAuthView(authView === "sign_in" ? "sign_up" : "sign_in");
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setResetLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`
      });
      if (error) {
        throw error;
      }
      toast.success("Password reset email sent! Check your inbox.");
      setAuthView("sign_in");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset password email");
    } finally {
      setResetLoading(false);
    }
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <AuthLoading />
      </div>;
  }

  // Password reset view
  if (authView === "forgotten_password") {
    return <div className="min-h-screen flex flex-col bg-gray-50 font-poppins">
        {/* Logo Header */}
        <div className="w-full p-4 bg-white shadow-sm">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="inline-block">
              <h1 className="text-black font-semibold text-base">Leena.ai</h1>
            </Link>
          </div>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gradient">Reset Password</h1>
              <p className="mt-2 text-gray-600 font-normal">
                Enter your email to receive a password reset link. The future of quick+ easy nutrition tracking. Just quick and easy nutrition tracking using the latest AI vision technology.
              </p>
            </div>
            
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </Label>
                <Input id="email" name="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="Your email address" />
              </div>
              
              <div>
                <Button type="submit" variant="gradient" className="w-full" disabled={resetLoading}>
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
              
              <div className="text-center">
                <button type="button" onClick={() => setAuthView("sign_in")} className="text-primary font-semibold hover:underline">
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
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
                <span className="font-semibold">Create Free Account</span>
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
              {authView === "sign_in" ? "Sign In" : "Create A Free Account"}
            </h1>
            <p className="mt-2 text-gray-600 font-normal">
              {authView === "sign_in" ? 
                "Welcome back to Leena.ai. Just quick and easy nutrition tracking using the latest AI vision technology." : 
                "Leena accurately tracks calories and macros from a single photo — no typing, no barcodes. Just quick and easy nutrition tracking using the latest AI vision technology."}
            </p>
          </div>

          {/* Mobile-optimized Supabase Auth UI */}
          <div className="supabase-auth-mobile">
            <style>
              {`
                .supabase-auth-mobile input {
                  font-size: 16px !important;
                  padding: 12px !important;
                  border-radius: 6px !important;
                  border: 1px solid #d1d5db !important;
                  width: 100% !important;
                  box-sizing: border-box !important;
                  -webkit-appearance: none !important;
                  -webkit-tap-highlight-color: transparent !important;
                  background-color: white !important;
                }
                
                .supabase-auth-mobile input:focus {
                  outline: none !important;
                  border-color: #8B5CF6 !important;
                  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
                }
                
                .supabase-auth-mobile button {
                  font-size: 16px !important;
                  padding: 12px !important;
                  border-radius: 6px !important;
                  -webkit-tap-highlight-color: transparent !important;
                }
                
                @media (max-width: 768px) {
                  .supabase-auth-mobile input {
                    font-size: 16px !important;
                    transform: none !important;
                    zoom: 1 !important;
                  }
                }
              `}
            </style>
            
            <SupabaseAuth 
              supabaseClient={supabase} 
              appearance={{
                theme: ThemeSupa,
                style: {
                  button: {
                    background: 'linear-gradient(to right, #D946EF, #8B5CF6)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    padding: '12px',
                    borderRadius: '6px'
                  },
                  input: {
                    fontSize: '16px',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    WebkitAppearance: 'none'
                  },
                  anchor: {
                    color: '#D946EF',
                    fontWeight: 600
                  },
                  message: {
                    fontWeight: 500
                  }
                },
                variables: {
                  default: {
                    colors: {
                      brand: '#8B5CF6',
                      brandAccent: '#D946EF'
                    }
                  }
                }
              }} 
              providers={[]} 
              redirectTo={`${window.location.origin}/auth/callback`} 
              view={authView} 
              showLinks={false}
              magicLink={false} 
              localization={{
                variables: {
                  sign_up: {
                    button_label: 'Create Free Account'
                  }
                }
              }}
            />
          </div>

          {/* Custom link handler that properly toggles between sign-in and sign-up views */}
          <div className="mt-4 text-center">
            <button onClick={toggleAuthView} className="text-gradient font-normal hover:underline">
              {authView === "sign_in" ? "Don't have an account? Create A Free Account" : "Already have an account? Sign in"}
            </button>
            
            {/* Password reset link - only show in sign_in view */}
            {authView === "sign_in" && <div className="mt-2">
                <button onClick={() => setAuthView("forgotten_password")} className="text-gradient font-normal hover:underline text-sm">
                  Forgot your password?
                </button>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};

export default Auth;
