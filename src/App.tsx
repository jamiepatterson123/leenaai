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

const queryClient = new QueryClient();

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
    const initializeAuth = async () => {
      try {
        // Check current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (sessionError.message.includes("refresh_token_not_found")) {
            await supabase.auth.signOut(); // Clear any invalid session data
            queryClient.clear(); // Clear any cached data
            toast.error("Your session has expired. Please sign in again.");
          } else {
            toast.error("Authentication error. Please try signing in again.");
          }
          if (mounted.current) {
            setSession(null);
            setLoading(false);
          }
          return;
        }

        if (mounted.current) {
          setSession(currentSession);
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event);
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          } else if (event === 'SIGNED_OUT') {
            queryClient.clear(); // Clear query cache on sign out
            if (mounted.current) {
              setSession(null);
            }
          }
          if (mounted.current) {
            setSession(newSession);
            setLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear any invalid session state
        await supabase.auth.signOut();
        queryClient.clear();
        toast.error("Failed to initialize authentication. Please sign in again.");
        if (mounted.current) {
          setSession(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();
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