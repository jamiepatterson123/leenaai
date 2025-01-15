import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, AuthError } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const queryClient = useQueryClient();

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
          await handleSessionError(sessionError);
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
            if (mounted.current) {
              setSession(newSession);
            }
          }
          
          if (event === 'SIGNED_IN') {
            console.log('User signed in');
            if (mounted.current) {
              setSession(newSession);
            }
          }

          if (!newSession && event === 'INITIAL_SESSION') {
            console.log('No initial session');
            queryClient.clear();
            if (mounted.current) {
              setSession(null);
            }
            return;
          }

          // Handle session errors
          if (!newSession) {
            console.error('Session expired or invalid');
            await handleSessionError();
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
        await handleSessionError(error as AuthError);
      }
    };

    initializeAuth();
  }, [queryClient]);

  const handleSessionError = async (error?: AuthError) => {
    console.error("Session error occurred:", error);
    await supabase.auth.signOut();
    queryClient.clear();
    if (error?.message?.includes('session_not_found') || error?.message?.includes('invalid_token')) {
      toast.error("Your session has expired. Please sign in again.");
    } else {
      toast.error("Authentication error. Please sign in again.");
    }
    if (mounted.current) {
      setSession(null);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};