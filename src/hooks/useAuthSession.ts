import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

export const useAuthSession = (queryClient: QueryClient) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSessionError = async (error: any) => {
    console.error("Session error:", error);
    
    try {
      await supabase.auth.signOut();
      queryClient.clear();
      
      if (mounted.current) {
        setSession(null);
        setLoading(false);
      }

      const errorMessage = error?.message || '';
      if (errorMessage.includes("session_not_found") || 
          errorMessage.includes("JWT expired")) {
        toast.error("Your session has expired. Please sign in again.");
      } else {
        toast.error("Authentication error. Please try signing in again.");
      }
    } catch (signOutError) {
      console.error("Error during sign out:", signOutError);
      if (mounted.current) {
        setSession(null);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let authListener: any;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          await handleSessionError(sessionError);
          return;
        }

        if (mounted.current) {
          setSession(currentSession);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event, newSession?.user?.id);
          
          if (mounted.current) {
            switch (event) {
              case 'SIGNED_OUT':
              case 'USER_DELETED':
                setSession(null);
                queryClient.clear();
                break;
              case 'SIGNED_IN':
              case 'TOKEN_REFRESHED':
                setSession(newSession);
                break;
              case 'USER_UPDATED':
                if (newSession) {
                  setSession(newSession);
                }
                break;
            }
            setLoading(false);
          }
        });

        authListener = subscription;
        
        if (mounted.current) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        await handleSessionError(error);
      }
    };

    initializeAuth();

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, [queryClient]);

  return { session, loading };
};