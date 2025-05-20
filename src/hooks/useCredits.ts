
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useCredits = () => {
  const queryClient = useQueryClient();

  const { data: creditInfo, isLoading } = useQuery({
    queryKey: ['user-credits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { credits: 0, subscribed: false };
      
      const { data, error } = await supabase
        .from("subscribers")
        .select("credits, subscribed")
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching credits:", error);
        return { credits: 0, subscribed: false };
      }
      
      return { 
        credits: data.credits || 0,
        subscribed: data.subscribed || false
      };
    }
  });

  const useCredit = async (): Promise<boolean> => {
    try {
      // Premium users bypass credit check
      if (creditInfo?.subscribed) {
        return true;
      }
      
      // Check if user has credits
      if (!creditInfo || creditInfo.credits <= 0) {
        toast.error("No credits remaining", {
          description: "Upgrade to premium for unlimited analysis or wait for your next free credit",
          action: {
            label: "Upgrade",
            onClick: () => {
              // Add navigation to upgrade page or open upgrade modal
            }
          }
        });
        return false;
      }
      
      // Deduct a credit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("subscribers")
        .update({ 
          credits: creditInfo.credits - 1,
          usage_count: (creditInfo.credits - 1) + 1 // Increment usage count
        })
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      // Invalidate the credits query to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      
      return true;
    } catch (error) {
      console.error("Error using credit:", error);
      toast.error("Failed to process credit");
      return false;
    }
  };
  
  const addCredit = async (amount = 1): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // Get current credits
      const { data } = await supabase
        .from("subscribers")
        .select("credits")
        .eq("user_id", user.id)
        .single();
      
      const currentCredits = data?.credits || 0;
      
      // Add the credits
      const { error } = await supabase
        .from("subscribers")
        .update({ credits: currentCredits + amount })
        .eq("user_id", user.id);
        
      if (error) throw error;
      
      // Invalidate the credits query to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      
      return true;
    } catch (error) {
      console.error("Error adding credits:", error);
      return false;
    }
  };

  return {
    credits: creditInfo?.credits || 0,
    isLoading,
    isPremium: creditInfo?.subscribed || false,
    useCredit,
    addCredit
  };
};
