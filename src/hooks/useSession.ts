import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        const { data: authSubscription } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event);
          
          if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
            setSession(newSession);
          } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !newSession)) {
            queryClient.clear();
            setSession(null);
          }
        });

        subscription = authSubscription.subscription;
        setLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        await handleSessionError();
      }
    };

    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  const handleSessionError = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    setSession(null);
    setLoading(false);
  };

  return { session, loading };
};