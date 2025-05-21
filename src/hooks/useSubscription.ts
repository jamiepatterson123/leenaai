import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "@/hooks/use-toast";
import { 
  trackPurchase, 
  trackSubscriptionStart, 
  trackInitiateCheckout, 
  trackOneTimeOfferView, 
  trackOneTimeOfferPurchase,
  trackFreeTrialUsage,
  trackFreeTrialExhausted,
  trackSubscriptionCancelled
} from "@/utils/metaPixel";

export interface SubscriptionState {
  isLoading: boolean;
  isSubscribed: boolean;
  usageCount: number;
  dailyLimitReached: boolean;
  hasFreeUsesRemaining: boolean;
  subscriptionEnd: Date | null;
  firstUsageTime: Date | null;
  lastUsageTime: Date | null;
  hoursUntilNextUse: number;
  isWithinFirst24Hours: boolean;
  subscriptionTier: string | null;
}

export const useSubscription = () => {
  const { session } = useSession();
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    isSubscribed: false,
    usageCount: 0,
    dailyLimitReached: false,
    hasFreeUsesRemaining: true,
    subscriptionEnd: null,
    firstUsageTime: null,
    lastUsageTime: null,
    hoursUntilNextUse: 0,
    isWithinFirst24Hours: false,
    subscriptionTier: null
  });

  // Check subscription status on mount and when session changes
  useEffect(() => {
    if (session) {
      checkSubscription();
    } else {
      setState({
        isLoading: false,
        isSubscribed: false,
        usageCount: 0,
        dailyLimitReached: false,
        hasFreeUsesRemaining: true,
        subscriptionEnd: null,
        firstUsageTime: null,
        lastUsageTime: null,
        hoursUntilNextUse: 0,
        isWithinFirst24Hours: false,
        subscriptionTier: null
      });
    }
  }, [session]);

  // Check URL params for subscription success/cancelled status
  useEffect(() => {
    const url = new URL(window.location.href);
    const successParam = url.searchParams.get("subscription_success");
    const cancelledParam = url.searchParams.get("subscription_cancelled");
    const yearlySuccessParam = url.searchParams.get("yearly_success");
    const cancelMonthlyParam = url.searchParams.get("cancel_monthly");
    const yearlyUpgraded = url.searchParams.get("yearly_upgraded");
    
    if (successParam === "true") {
      toast({
        title: "Subscription successful!",
        description: "You now have unlimited access.",
        variant: "default",
      });
      
      // Track purchase event with Meta Pixel
      trackPurchase(10, 'USD');
      // Also track subscription start event
      trackSubscriptionStart(10, 'USD', undefined, 'monthly');
      
      // Remove params from URL
      url.searchParams.delete("subscription_success");
      window.history.replaceState({}, document.title, url.toString());
      // Refresh subscription status
      checkSubscription();
    } else if (cancelledParam === "true") {
      toast({
        title: "Subscription cancelled",
        description: "You can try again later.",
        variant: "default",
      });
      // Remove params from URL
      url.searchParams.delete("subscription_cancelled");
      window.history.replaceState({}, document.title, url.toString());
    } else if (yearlySuccessParam === "true") {
      toast({
        title: "Yearly subscription successful!",
        description: "Thanks for upgrading to the annual plan!",
        variant: "default",
      });
      
      // Track yearly purchase with Meta Pixel
      trackOneTimeOfferPurchase(99, 'USD');
      
      // If there's a monthly subscription to cancel
      if (cancelMonthlyParam) {
        cancelSubscription(cancelMonthlyParam);
      }
      
      // Remove params from URL
      url.searchParams.delete("yearly_success");
      url.searchParams.delete("cancel_monthly");
      window.history.replaceState({}, document.title, url.toString());
      // Refresh subscription status
      checkSubscription();
    } else if (yearlyUpgraded === "true") {
      toast({
        title: "Successfully upgraded to yearly plan!",
        description: "You now have unlimited access for a full year.",
        variant: "default",
      });
      
      url.searchParams.delete("yearly_upgraded");
      window.history.replaceState({}, document.title, url.toString());
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if (!session) return;
    
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {});
      
      if (error) {
        console.error("Error checking subscription:", error);
        toast({
          title: "Error",
          description: "Failed to check subscription status",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Subscription data:", data);
      
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
      setState((prev) => ({ ...prev, isLoading: false }));
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
      
      setState((prev) => ({
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

  const redirectToCheckout = async () => {
    if (!session) {
      toast({
        title: "Error",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }
    
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      // Track InitiateCheckout event with Meta Pixel
      trackInitiateCheckout(10, 'USD');
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {});
      
      if (error) {
        console.error("Error creating checkout session:", error);
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
        return;
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Exception creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const redirectToYearlyCheckout = async (priceId?: string) => {
    if (!session) {
      toast({
        title: "Error",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }
    
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke("create-yearly-checkout", {
        body: { 
          subscription_id: priceId ? undefined : undefined,
          price_id: priceId || "price_1RP4bMLKGAMmFDpiFaJZpYlb" // Use provided price ID or the default
        }
      });
      
      if (error) {
        console.error("Error creating yearly checkout session:", error);
        toast({
          title: "Error",
          description: "Failed to create yearly checkout session",
          variant: "destructive",
        });
        return;
      }
      
      // Track InitiateCheckout event with Meta Pixel
      trackInitiateCheckout(99, 'USD');
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Exception creating yearly checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to create yearly checkout session",
        variant: "destructive",
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
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
      
      // Track subscription cancellation
      trackSubscriptionCancelled();
      
      console.log("Monthly subscription canceled successfully:", data);
    } catch (error) {
      console.error("Exception canceling subscription:", error);
    }
  };

  const redirectToCustomerPortal = async () => {
    if (!session) {
      toast({
        title: "Error",
        description: "Please log in to manage your subscription",
        variant: "destructive",
      });
      return;
    }
    
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {});
      
      if (error) {
        console.error("Error creating portal session:", error);
        toast({
          title: "Error",
          description: "Failed to create customer portal session",
          variant: "destructive",
        });
        return;
      }
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Exception creating portal session:", error);
      toast({
        title: "Error",
        description: "Failed to create customer portal session",
        variant: "destructive",
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...state,
    checkSubscription,
    incrementUsage,
    redirectToCheckout,
    redirectToYearlyCheckout,
    redirectToCustomerPortal,
  };
};
