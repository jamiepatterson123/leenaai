
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { StatusBadge } from "./StatusBadge";
import { UsageStatus } from "./UsageStatus";
import { SubscriptionActions } from "./SubscriptionActions";
import { LoadingState } from "./LoadingState";

export const SubscriptionBadge: React.FC = () => {
  const {
    isLoading,
    isSubscribed,
    usageCount,
    dailyLimitReached,
    isWithinFirst24Hours,
    hoursUntilNextUse,
    redirectToCustomerPortal,
    checkSubscription,
    subscriptionTier
  } = useSubscription();
  
  const handleRefresh = async () => {
    toast.info("Checking subscription status...");
    await checkSubscription();
    toast.success("Subscription status refreshed");
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (isSubscribed) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <StatusBadge tier={subscriptionTier} />
        <SubscriptionActions 
          isSubscribed={true}
          redirectToCustomerPortal={redirectToCustomerPortal}
          handleRefresh={handleRefresh}
        />
      </div>
    );
  }

  // Free tier display
  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <UsageStatus 
        isWithinFirst24Hours={isWithinFirst24Hours}
        usageCount={usageCount}
        dailyLimitReached={dailyLimitReached}
        hoursUntilNextUse={hoursUntilNextUse}
      />
      <SubscriptionActions 
        isSubscribed={false}
        redirectToCustomerPortal={redirectToCustomerPortal}
        handleRefresh={handleRefresh}
      />
    </div>
  );
};
