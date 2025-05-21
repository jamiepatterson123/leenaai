
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { toast } from "@/hooks/use-toast";
import { useSubscriptionState } from "./useSubscriptionState";
import { useSubscriptionActions } from "./useSubscriptionActions";
import { useSubscriptionCallbacks } from "./useSubscriptionCallbacks";
import { useSubscriptionEffects } from "./useSubscriptionEffects";
import { SubscriptionState } from "./types";

export const useSubscription = () => {
  const { session } = useSession();
  const state = useSubscriptionState();
  const actions = useSubscriptionActions(session, state);
  const callbacks = useSubscriptionCallbacks(session, state);
  
  // Handle URL parameters for subscription status
  useSubscriptionEffects(session, {
    checkSubscription: actions.checkSubscription,
    cancelSubscription: actions.cancelSubscription
  });
  
  // Check subscription status on mount and when session changes
  useEffect(() => {
    if (session) {
      actions.checkSubscription();
    } else {
      state.resetState();
    }
  }, [session]);

  return {
    ...state.state,
    checkSubscription: actions.checkSubscription,
    incrementUsage: actions.incrementUsage,
    redirectToCheckout: callbacks.redirectToCheckout,
    redirectToYearlyCheckout: callbacks.redirectToYearlyCheckout,
    redirectToCustomerPortal: callbacks.redirectToCustomerPortal,
  };
};

export type { SubscriptionState } from "./types";
