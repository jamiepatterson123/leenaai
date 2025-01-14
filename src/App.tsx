import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useEffect, useState, useRef } from "react";
import { supabase } from "./integrations/supabase/client";
import { toast } from "sonner";
import Index from "./pages/Index";
import FoodDiary from "./pages/FoodDiary";
import Profile from "./pages/Profile";
import { Reports } from "./pages/Reports";
import { Navigation } from "./components/Navigation";
import Auth from "./pages/Auth";
import type { Session } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let authListener: any;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Initial session error:", sessionError);
          await handleSessionError(sessionError);
          return;
        }

        // Set initial session if component is still mounted
        if (mounted.current) {
          setSession(currentSession);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event, newSession?.user?.id);
          
          if (mounted.current) {
            switch (event) {
              case 'SIGNED_OUT':
                setSession(null);
                queryClient.clear();
                break;
              case 'SIGNED_IN':
              case 'TOKEN_REFRESHED':
                setSession(newSession);
                break;
              case 'USER_UPDATED':
                if (newSession) {
                  setSession(newSession);
                }
                break;
            }
            setLoading(false);
          }
        });

        authListener = subscription;
        
        if (mounted.current) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        await handleSessionError(error);
      }
    };

    const handleSessionError = async (error: any) => {
      console.error("Handling session error:", error);
      
      try {
        // Clear session and cached data
        await supabase.auth.signOut();
        queryClient.clear();
        
        if (mounted.current) {
          setSession(null);
          setLoading(false);
        }

        // Show appropriate error message
        const errorMessage = error?.message || '';
        if (errorMessage.includes("session_not_found") || 
            errorMessage.includes("JWT expired") ||
            errorMessage.includes("refresh_token_not_found")) {
          toast.error("Your session has expired. Please sign in again.");
        } else {
          toast.error("Authentication error. Please try signing in again.");
        }
      } catch (signOutError) {
        console.error("Error during sign out:", signOutError);
        if (mounted.current) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    // Initialize authentication
    initializeAuth();

    // Cleanup function
    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen pb-10">
          <Navigation />
          <Routes>
            <Route path="/welcome" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-diary"
              element={
                <ProtectedRoute>
                  <FoodDiary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;