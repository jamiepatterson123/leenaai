import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setLoading(false);

        // Set up auth state change subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event);
          
          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            setSession(newSession);
          }

          if (!newSession && event === 'INITIAL_SESSION') {
            queryClient.clear();
            setSession(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        await handleSessionError();
      }
    };

    initializeAuth();
  }, [queryClient]); // Add queryClient to dependencies

  const handleSessionError = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    setSession(null);
    setLoading(false);
  };

  return { session, loading };
};