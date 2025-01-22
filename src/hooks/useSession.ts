import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            toast.error("Session error. Please sign in again.");
            setSession(null);
          }
        } else if (mounted && initialSession) {
          setSession(initialSession);
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          toast.error("Authentication error. Please sign in again.");
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize session
    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN') {
        setSession(newSession);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        queryClient.clear();
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        setLoading(false);
      } else if (event === 'USER_UPDATED') {
        setSession(newSession);
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return { session, loading };
};