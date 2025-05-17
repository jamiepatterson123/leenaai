
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          setLoading(false);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, newSession) => {
            console.log("Auth state changed:", event);

            if (!mounted) return;

            if (event === 'SIGNED_IN') {
              setSession(newSession);
              queryClient.clear(); // Clear query cache on sign in
            } else if (event === 'SIGNED_OUT') {
              setSession(null);
              queryClient.clear(); // Clear query cache on sign out
            } else if (event === 'TOKEN_REFRESHED') {
              setSession(newSession);
            } else if (event === 'USER_UPDATED') {
              setSession(newSession);
            }
          }
        );

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setSession(null);
          setLoading(false);
          await handleSessionError();
        }
      }
    };

    initializeAuth();
  }, [queryClient]);

  const handleSessionError = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear();
    } catch (error) {
      console.error("Error handling session error:", error);
    }
  };

  return { session, loading };
};
