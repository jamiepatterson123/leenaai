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
import type { Session, AuthError } from "@supabase/supabase-js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
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
    const initializeAuth = async () => {
      try {
        // Check current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted.current) {
            setSession(null);
            setLoading(false);
          }
          return;
        }

        // If no session, try to refresh it
        if (!currentSession) {
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Session refresh error:", refreshError);
            if (mounted.current) {
              setSession(null);
              setLoading(false);
            }
            return;
          }
          if (mounted.current) {
            setSession(refreshedSession);
          }
        } else {
          if (mounted.current) {
            setSession(currentSession);
          }
        }

        if (mounted.current) {
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event);
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }
          
          if (event === 'SIGNED_OUT') {
            queryClient.clear(); // Clear query cache on sign out
          }

          // Handle session errors
          if ((event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') && !newSession) {
            console.error('Session expired or invalid');
            await supabase.auth.signOut();
            queryClient.clear();
            toast.error("Your session has expired. Please sign in again.");
            if (mounted.current) {
              setSession(null);
            }
            return;
          }

          if (mounted.current) {
            setSession(newSession);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
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