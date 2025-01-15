import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            await handleSessionError();
          }
        } else if (mounted && initialSession) {
          setSession(initialSession);
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          await handleSessionError();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const handleSessionError = async () => {
      // Clear all auth data
      await supabase.auth.signOut();
      
      // Clear all local storage tokens
      localStorage.removeItem('sb-tehosjvonqxuiziqjlry-auth-token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      
      setSession(null);
      queryClient.clear();
      toast.error("Session expired. Please sign in again.");
      navigate('/welcome');
    };

    // Initialize session
    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN') {
        setSession(newSession);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null);
        queryClient.clear();
        // Clear all local storage tokens
        localStorage.removeItem('sb-tehosjvonqxuiziqjlry-auth-token');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        navigate('/welcome');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed:', newSession);
        setSession(newSession);
      } else if (event === 'USER_UPDATED') {
        setSession(newSession);
      }

      setLoading(false);
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, navigate]);

  return { session, loading };
};