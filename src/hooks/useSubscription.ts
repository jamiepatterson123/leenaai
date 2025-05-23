
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
    incrementUsage: async () => true,
    redirectToCheckout: async () => {},
    redirectToCustomerPortal: async () => {},
  };
};

export type { SubscriptionState };
