
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
              
              // We no longer set confetti here - only for sign-up events in Auth.tsx
              
              // Check for daily free credit eligibility
              if (newSession?.user) {
                setTimeout(() => {
                  checkAndApplyDailyCredit(newSession.user.id);
                }, 0);
              }
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

        // If user is signed in on initial load, check for daily free credit
        if (currentSession?.user) {
          checkAndApplyDailyCredit(currentSession.user.id);
        }

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

  const checkAndApplyDailyCredit = async (userId: string) => {
    try {
      // Get the user's last usage time
      const { data: subscriber, error: subscriberError } = await supabase
        .from("subscribers")
        .select("last_usage_time, credits")
        .eq("user_id", userId)
        .single();
      
      if (subscriberError) {
        console.error("Error fetching subscriber data:", subscriberError);
        return;
      }
      
      if (!subscriber) return;
      
      const lastUsageTime = subscriber.last_usage_time ? new Date(subscriber.last_usage_time) : null;
      const now = new Date();
      
      // If it's been more than 24 hours since last usage time, add a free credit
      if (!lastUsageTime || (now.getTime() - lastUsageTime.getTime() > 24 * 60 * 60 * 1000)) {
        const { error: updateError } = await supabase
          .from("subscribers")
          .update({ 
            credits: subscriber.credits + 1,
            last_usage_time: now.toISOString()
          })
          .eq("user_id", userId);
        
        if (updateError) {
          console.error("Error updating credits:", updateError);
        } else {
          console.log("Daily free credit added successfully");
        }
      }
    } catch (error) {
      console.error("Error checking/applying daily credit:", error);
    }
  };

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
