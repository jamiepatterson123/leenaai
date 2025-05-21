
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackInitiateCheckout, trackSubscriptionCancelled } from "@/utils/metaPixel";
import { SubscriptionState } from "./types";

type SubscriptionStateHook = {
  state: SubscriptionState;
  setState: React.Dispatch<React.SetStateAction<SubscriptionState>>;
};

export const useSubscriptionCallbacks = (
  session: Session | null,
  { state, setState }: SubscriptionStateHook
) => {
  const redirectToCheckout = async () => {
    if (!session) {
      toast({
        title: "Error",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }
    
    setState((prev: SubscriptionState) => ({ ...prev, isLoading: true }));
    
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
      setState((prev: SubscriptionState) => ({ ...prev, isLoading: false }));
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
    
    setState((prev: SubscriptionState) => ({ ...prev, isLoading: true }));
    
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
      setState((prev: SubscriptionState) => ({ ...prev, isLoading: false }));
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
    
    setState((prev: SubscriptionState) => ({ ...prev, isLoading: true }));
    
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
      setState((prev: SubscriptionState) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    redirectToCheckout,
    redirectToYearlyCheckout,
    cancelSubscription,
    redirectToCustomerPortal,
  };
};
