import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

export const useSession = () => {
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
        // Get initial session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session initialization error:", sessionError);
          await handleSessionError();
          return;
        }
        
        if (mounted.current) {
          setSession(currentSession);
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event, "New session:", newSession?.user?.id);
          
          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            if (mounted.current) {
              setSession(newSession);
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted.current) {
              setSession(null);
              queryClient.clear();
            }
          }

          if (!newSession && event === 'INITIAL_SESSION') {
            queryClient.clear();
            if (mounted.current) {
              setSession(null);
              setLoading(false);
            }
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
  }, [queryClient]);

  const handleSessionError = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear();
      if (mounted.current) {
        setSession(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error handling session error:", error);
      if (mounted.current) {
        setSession(null);
        setLoading(false);
      }
    }
  };

  return { session, loading };
};