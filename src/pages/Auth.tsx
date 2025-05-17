import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
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
  return <div className="min-h-screen flex flex-col bg-gray-50 font-poppins">
      {/* Logo Header */}
      <div className="w-full p-4 bg-white shadow-sm">
        <div className="container mx-auto">
          <Link to="/" className="inline-block">
            <h1 className="text-primary font-semibold text-base">Leena.ai</h1>
          </Link>
        </div>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary">{authView === "sign_in" ? "Sign In" : "Sign Up"}</h1>
            <p className="mt-2 text-gray-600">
              {authView === "sign_in" ? "Welcome back to Leena.ai" : "Start tracking your nutrition for free"}
            </p>
          </div>

          <SupabaseAuth supabaseClient={supabase} appearance={{
          theme: ThemeSupa
        }} providers={[]} redirectTo={`${window.location.origin}/auth/callback`} view={authView} />
        </div>
      </div>
    </div>;
};
export default Auth;