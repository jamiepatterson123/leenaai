
import React from 'react';
import { useSession } from '@/hooks/useSession';

export interface SubscriptionState {
  isLoading: boolean;
  isSubscribed: boolean;
  trialActive: boolean;
  trialDaysRemaining: number;
  trialEndDate: Date | null;
  hasAccess: boolean;
}

export const useSubscription = () => {
  const { session } = useSession();
  const [isLoading, setIsLoading] = React.useState(false);
  const [subscriptionState, setSubscriptionState] = React.useState<SubscriptionState>({
    isLoading: false,
    isSubscribed: true, // Always subscribed now
    trialActive: false,
    trialDaysRemaining: 0,
    trialEndDate: null,
    hasAccess: true, // Always has access
  });

  // No-op functions for compatibility
  const checkSubscription = React.useCallback(async () => {
    // No longer needed
  }, []);

  const redirectToCheckout = async () => {
    // No longer needed
  };

  const redirectToCustomerPortal = async () => {
    // No longer needed
  };

  const redirectToYearlyCheckout = async () => {
    // No longer needed
  };

  return {
    isLoading: false,
    isSubscribed: true, // Always subscribed
    trialActive: false,
    trialDaysRemaining: 0,
    trialEndDate: null,
    hasAccess: true, // Always has access
    checkSubscription,
    redirectToCheckout,
    redirectToCustomerPortal,
    redirectToYearlyCheckout,
    // Legacy properties for compatibility
    dailyLimitReached: false,
    usageCount: 0,
    usageRemaining: 999,
    isWithinFirst24Hours: false,
    hoursUntilNextUse: 0,
    FREE_USAGE_LIMIT: 0,
  };
};
