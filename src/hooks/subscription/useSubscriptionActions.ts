
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackFreeTrialUsage, trackFreeTrialExhausted } from "@/utils/metaPixel";
import { SubscriptionState } from "./types";

type SubscriptionStateHook = {
  state: SubscriptionState;
  setState: React.Dispatch<React.SetStateAction<SubscriptionState>>;
};

export const useSubscriptionActions = (
  session: Session | null,
  { state, setState }: SubscriptionStateHook
) => {
  const checkSubscription = async () => {
    if (!session) return;
    
    // Set loading state before checking
    setState((prev: SubscriptionState) => ({ ...prev, isLoading: true }));
    
    try {
      // Get subscription_id from URL if available
      const url = new URL(window.location.href);
      const subscriptionId = url.searchParams.get('subscription_id');
      
      // Pass subscription_id as query parameter if available
      const queryParams = subscriptionId ? `?subscription_id=${subscriptionId}` : '';
      
      console.log("Checking subscription status", { 
        hasSubscriptionId: !!subscriptionId
      });
      
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: subscriptionId ? { subscription_id: subscriptionId } : undefined
      });
      
      if (error) {
        console.error("Error checking subscription:", error);
        toast({
          title: "Error",
          description: "Failed to check subscription status",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Received subscription data:", data);
      
      const now = new Date();
      const firstTime = data.first_usage_time ? new Date(data.first_usage_time) : null;
      const isWithinFirst24Hours = firstTime && 
        (now.getTime() - firstTime.getTime() < 24 * 60 * 60 * 1000);
      
      setState({
        isLoading: false,
        isSubscribed: data.subscribed || false,
        usageCount: data.usage_count || 0,
        dailyLimitReached: data.daily_limit_reached || false,
        hasFreeUsesRemaining: data.has_free_uses_remaining || false,
        subscriptionEnd: data.subscription_end ? new Date(data.subscription_end) : null,
        firstUsageTime: data.first_usage_time ? new Date(data.first_usage_time) : null,
        lastUsageTime: data.last_usage_time ? new Date(data.last_usage_time) : null,
        hoursUntilNextUse: data.hours_until_next_use || 0,
        isWithinFirst24Hours,
        subscriptionTier: data.subscription_tier || null
      });
    } catch (error) {
      console.error("Exception checking subscription:", error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setState((prev: SubscriptionState) => ({ ...prev, isLoading: false }));
    }
  };

  const incrementUsage = async () => {
    if (!session) return false;
    
    // If user is subscribed, don't count usage
    if (state.isSubscribed) {
      return true; // Allow unlimited usage for subscribed users
    }
    
    try {
      const { data, error } = await supabase.functions.invoke("increment-usage", {});
      
      if (error) {
        console.error("Error incrementing usage:", error);
        toast({
          title: "Error",
          description: "Failed to update usage count",
          variant: "destructive",
        });
        return false;
      }
      
      console.log("Updated usage data:", data);
      
      // Track free trial usage with Meta Pixel
      if (data.usage_count) {
        trackFreeTrialUsage(data.usage_count);
        
        // Track when free trial is exhausted
        if (data.daily_limit_reached) {
          trackFreeTrialExhausted();
        }
      }
      
      setState((prev: SubscriptionState) => ({
        ...prev,
        usageCount: data.usage_count || prev.usageCount,
        dailyLimitReached: data.daily_limit_reached || false,
        hasFreeUsesRemaining: data.has_free_uses_remaining || false,
        lastUsageTime: new Date(),
        isWithinFirst24Hours: data.within_first_24_hours || false,
        hoursUntilNextUse: data.hours_until_next_use || 0
      }));
      
      return !data.daily_limit_reached;
    } catch (error) {
      console.error("Exception incrementing usage:", error);
      toast({
        title: "Error",
        description: "Failed to update usage count",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { subscription_id: subscriptionId }
      });
      
      if (error) {
        console.error("Error canceling subscription:", error);
        return;
      }
      
      console.log("Monthly subscription canceled successfully:", data);
    } catch (error) {
      console.error("Exception canceling subscription:", error);
    }
  };

  return {
    checkSubscription,
    incrementUsage,
    cancelSubscription
  };
};
