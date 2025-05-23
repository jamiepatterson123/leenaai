import { useEffect, useRef } from "react";
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
  const checkInProgress = useRef(false);
  const initialCheckDone = useRef(false);
  
  // Function to handle subscription check with debouncing
  const safeCheckSubscription = async () => {
    if (checkInProgress.current) {
      console.log("Subscription check already in progress, skipping");
      return;
    }
    
    try {
      checkInProgress.current = true;
      await actions.checkSubscription();
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      checkInProgress.current = false;
    }
  };
  
  // Check URL params for subscription success/cancelled status
  useEffect(() => {
    if (!session) return;
    
    const url = new URL(window.location.href);
    const successParam = url.searchParams.get("subscription_success");
    const cancelledParam = url.searchParams.get("subscription_cancelled");
    const yearlySuccessParam = url.searchParams.get("yearly_success");
    const cancelMonthlyParam = url.searchParams.get("cancel_monthly");
    const yearlyUpgraded = url.searchParams.get("yearly_upgraded");
    const subscriptionId = url.searchParams.get("subscription_id");
    
    // Immediately check subscription at mount, regardless of URL params
    if (!initialCheckDone.current) {
      console.log("useSubscriptionEffects: Initial check on mount");
      safeCheckSubscription();
      initialCheckDone.current = true;
    }
    
    // Handle subscription_id parameter even without success param
    // This ensures we detect subscription changes from redirects
    if (subscriptionId) {
      console.log("useSubscriptionEffects: Found subscription ID in URL, checking subscription status", { subscriptionId });
      
      // Perform multiple checks with increasing delays
      safeCheckSubscription();
      
      const checkTimes = [500, 1000, 2000, 5000, 10000, 15000];
      checkTimes.forEach(delay => {
        setTimeout(() => safeCheckSubscription(), delay);
      });
      
      // Remove the subscription_id parameter after checks to avoid duplicate processing
      // But only if no other subscription parameters are present
      if (!successParam && !yearlySuccessParam && !yearlyUpgraded) {
        setTimeout(() => {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("subscription_id");
          window.history.replaceState({}, document.title, newUrl.toString());
        }, 20000); // Wait long enough for all checks to complete
      }
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
      
      // Remove params from URL but keep subscription_id param for check-subscription function
      url.searchParams.delete("subscription_success");
      window.history.replaceState({}, document.title, url.toString());
      
      // Refresh subscription status immediately and multiple times with delays
      safeCheckSubscription();
      
      const checkTimes = [1000, 2000, 5000, 10000, 15000];
      checkTimes.forEach(delay => {
        setTimeout(() => safeCheckSubscription(), delay);
      });
      
    } else if (cancelledParam === "true") {
      toast({
        title: "Subscription cancelled",
        description: "You can try again later.",
        variant: "default",
      });
      // Remove params from URL
      url.searchParams.delete("subscription_cancelled");
      window.history.replaceState({}, document.title, url.toString());
      
      // Refresh subscription status
      safeCheckSubscription();
      
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
      
      // Refresh subscription status multiple times
      safeCheckSubscription();
      
      const checkTimes = [1000, 2000, 5000, 10000, 15000];
      checkTimes.forEach(delay => {
        setTimeout(() => safeCheckSubscription(), delay);
      });
      
    } else if (yearlyUpgraded === "true") {
      toast({
        title: "Successfully upgraded to yearly plan!",
        description: "You now have unlimited access for a full year.",
        variant: "default",
      });
      
      url.searchParams.delete("yearly_upgraded");
      window.history.replaceState({}, document.title, url.toString());
      
      // Refresh subscription status multiple times
      safeCheckSubscription();
      
      const checkTimes = [1000, 2000, 5000, 10000, 15000];
      checkTimes.forEach(delay => {
        setTimeout(() => safeCheckSubscription(), delay);
      });
    }
  }, [session]);
  
  // Add a second effect to check subscription status periodically
  useEffect(() => {
    if (!session) return;
    
    // Check subscription status every 30 seconds
    const intervalId = setInterval(() => {
      console.log("useSubscriptionEffects: Periodic subscription check");
      safeCheckSubscription();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [session]);
};
