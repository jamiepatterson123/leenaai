
// This is a mock implementation to replace the deleted subscription functionality
// while maintaining compatibility with any components that haven't been fully cleaned up

export interface SubscriptionState {
  isLoading: boolean;
  isSubscribed: boolean;
}

export const useSubscription = () => {
  return {
    isLoading: false,
    isSubscribed: false,
    checkSubscription: async () => {},
    incrementUsage: async () => true, // Always return true to allow usage
    redirectToCheckout: async () => {},
    redirectToCustomerPortal: async () => {},
    redirectToYearlyCheckout: async () => {},
    dailyLimitReached: false,
    usageCount: 0,
    isWithinFirst24Hours: false,
    hoursUntilNextUse: 0,
  };
};

// Export the type, not a duplicate declaration
export type { SubscriptionState };
