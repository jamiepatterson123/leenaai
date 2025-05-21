import { useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { trackPurchase, trackSubscriptionStart, trackOneTimeOfferPurchase } from "@/utils/metaPixel";

export type SubscriptionActions = {
  checkSubscription: () => Promise<void>;
  cancelSubscription?: (subscriptionId: string) => Promise<void>;
};

export const useSubscriptionEffects = (
  session: Session | null,
  actions: SubscriptionActions
) => {
  // Check URL params for subscription success/cancelled status
  useEffect(() => {
    const url = new URL(window.location.href);
    const successParam = url.searchParams.get("subscription_success");
    const cancelledParam = url.searchParams.get("subscription_cancelled");
    const yearlySuccessParam = url.searchParams.get("yearly_success");
    const cancelMonthlyParam = url.searchParams.get("cancel_monthly");
    const yearlyUpgraded = url.searchParams.get("yearly_upgraded");
    const subscriptionId = url.searchParams.get("subscription_id");
    
    // Immediately check subscription at mount, regardless of URL params
    if (session) {
      actions.checkSubscription();
    }
    
    // Handle subscription_id parameter even without success param
    // This ensures we detect subscription changes from redirects
    if (subscriptionId) {
      console.log("Found subscription ID in URL, checking subscription status", { subscriptionId });
      
      // Perform an immediate check
      actions.checkSubscription();
      
      // Check several times to ensure webhook has processed
      setTimeout(() => actions.checkSubscription(), 2000);
      setTimeout(() => actions.checkSubscription(), 5000);
      setTimeout(() => actions.checkSubscription(), 15000);
    }
    
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
      
      // Keep subscription_id param as it's needed for the check-subscription function
      if (!subscriptionId) {
        window.history.replaceState({}, document.title, url.toString());
      }
      
      // Refresh subscription status immediately
      actions.checkSubscription();
      
      // Check several times after a delay to ensure webhook has processed
      setTimeout(() => actions.checkSubscription(), 2000);
      setTimeout(() => actions.checkSubscription(), 5000);
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
      if (cancelMonthlyParam && actions.cancelSubscription) {
        actions.cancelSubscription(cancelMonthlyParam);
      }
      
      // Remove params from URL
      url.searchParams.delete("yearly_success");
      url.searchParams.delete("cancel_monthly");
      window.history.replaceState({}, document.title, url.toString());
      
      // Refresh subscription status
      actions.checkSubscription();
      
      // Check several times after a delay
      setTimeout(() => actions.checkSubscription(), 2000);
      setTimeout(() => actions.checkSubscription(), 5000);
    } else if (yearlyUpgraded === "true") {
      toast({
        title: "Successfully upgraded to yearly plan!",
        description: "You now have unlimited access for a full year.",
        variant: "default",
      });
      
      url.searchParams.delete("yearly_upgraded");
      window.history.replaceState({}, document.title, url.toString());
      
      actions.checkSubscription();
      
      // Check several times after a delay
      setTimeout(() => actions.checkSubscription(), 2000);
      setTimeout(() => actions.checkSubscription(), 5000);
    }
  }, []);
  
  // Add a second effect to check subscription status on mount
  useEffect(() => {
    if (session) {
      actions.checkSubscription();
    }
  }, [session]);
};
