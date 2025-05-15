
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "@/hooks/use-toast";
import { trackPurchase, trackSubscriptionStart } from "@/utils/metaPixel";

export interface SubscriptionState {
  isLoading: boolean;
  isSubscribed: boolean;
  usageCount: number;
  freeUsesRemaining: number;
  hasFreeUsesRemaining: boolean;
  subscriptionEnd: Date | null;
}

export const useSubscription = () => {
  const { session } = useSession();
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    isSubscribed: false,
    usageCount: 0,
    freeUsesRemaining: 10,
    hasFreeUsesRemaining: true,
    subscriptionEnd: null
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
        freeUsesRemaining: 10,
        hasFreeUsesRemaining: true,
        subscriptionEnd: null
      });
    }
  }, [session]);

  // Check URL params for subscription success/cancelled status
  useEffect(() => {
    const url = new URL(window.location.href);
    const successParam = url.searchParams.get("subscription_success");
    const cancelledParam = url.searchParams.get("subscription_cancelled");
    
    if (successParam === "true") {
      toast({
        title: "Subscription successful!",
        description: "You now have unlimited access.",
        variant: "default",
      });
      
      // Track purchase event with Meta Pixel
      trackPurchase(10, 'USD');
      // Also track subscription start event
      trackSubscriptionStart(10, 'USD');
      
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
      
      setState({
        isLoading: false,
        isSubscribed: data.subscribed || false,
        usageCount: data.usage_count || 0,
        freeUsesRemaining: data.free_uses_remaining || 0,
        hasFreeUsesRemaining: data.has_free_uses_remaining || false,
        subscriptionEnd: data.subscription_end ? new Date(data.subscription_end) : null
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
      
      setState((prev) => ({
        ...prev,
        usageCount: data.usage_count || prev.usageCount,
        freeUsesRemaining: data.free_uses_remaining || prev.freeUsesRemaining,
        hasFreeUsesRemaining: data.has_free_uses_remaining || prev.hasFreeUsesRemaining,
      }));
      
      return data.has_free_uses_remaining;
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
      
      // Track InitiateCheckout event with Meta Pixel
      trackInitiateCheckout(10, 'USD');
      
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
    redirectToCustomerPortal,
  };
};
