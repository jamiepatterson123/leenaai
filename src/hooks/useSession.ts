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
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session retrieval error:", sessionError);
          throw sessionError;
        }

        if (mounted) {
          setSession(currentSession);
        }

        // Set up auth state change listener
        const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession) => {
          console.log("Auth state changed:", event);

          if (!mounted) return;

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setSession(newSession);
          } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            setSession(null);
            queryClient.clear();
          } else if (event === 'INITIAL_SESSION') {
            setSession(newSession);
          }
        });

        subscription = authSubscription.subscription;
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          await handleSessionError();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  const handleSessionError = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear();
      setSession(null);
      setLoading(false);
    } catch (error) {
      console.error("Error handling session error:", error);
    }
  };

  return { session, loading };
};