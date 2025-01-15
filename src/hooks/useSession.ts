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
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted.current) {
          setSession(currentSession);
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event);
          
          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            if (mounted.current) {
              setSession(newSession);
            }
          }

          if (!newSession && event === 'INITIAL_SESSION') {
            queryClient.clear();
            if (mounted.current) {
              setSession(null);
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
    await supabase.auth.signOut();
    queryClient.clear();
    if (mounted.current) {
      setSession(null);
      setLoading(false);
    }
  };

  return { session, loading };
};