
import { useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { trackPurchase, trackSubscriptionStart, trackOneTimeOfferPurchase } from "@/utils/metaPixel";

type SubscriptionActions = {
  checkSubscription: () => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
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
      actions.checkSubscription();
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
        actions.cancelSubscription(cancelMonthlyParam);
      }
      
      // Remove params from URL
      url.searchParams.delete("yearly_success");
      url.searchParams.delete("cancel_monthly");
      window.history.replaceState({}, document.title, url.toString());
      // Refresh subscription status
      actions.checkSubscription();
    } else if (yearlyUpgraded === "true") {
      toast({
        title: "Successfully upgraded to yearly plan!",
        description: "You now have unlimited access for a full year.",
        variant: "default",
      });
      
      url.searchParams.delete("yearly_upgraded");
      window.history.replaceState({}, document.title, url.toString());
      actions.checkSubscription();
    }
  }, []);
};
