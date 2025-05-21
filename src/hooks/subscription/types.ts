
export interface SubscriptionState {
  isLoading: boolean;
  isSubscribed: boolean;
  usageCount: number;
  dailyLimitReached: boolean;
  hasFreeUsesRemaining: boolean;
  subscriptionEnd: Date | null;
  firstUsageTime: Date | null;
  lastUsageTime: Date | null;
  hoursUntilNextUse: number;
  isWithinFirst24Hours: boolean;
  subscriptionTier: string | null;
}
