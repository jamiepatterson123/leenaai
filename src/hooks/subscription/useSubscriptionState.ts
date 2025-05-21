
import { useState } from "react";
import { SubscriptionState } from "./types";

export const useSubscriptionState = () => {
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

  const resetState = () => {
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
  };

  return { state, setState, resetState };
};
