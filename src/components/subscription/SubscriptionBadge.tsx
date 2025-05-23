
import React, { useEffect, useState } from "react";
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
  
  const [forceCheck, setForceCheck] = useState(0);
  
  // Immediately check subscription status on mount
  useEffect(() => {
    checkSubscription();
    
    // Check again after short delays to catch any state changes
    const timeouts = [
      setTimeout(() => checkSubscription(), 1000),
      setTimeout(() => checkSubscription(), 3000),
      setTimeout(() => checkSubscription(), 7000)
    ];
    
    // Check if URL has subscription-related parameters
    const url = new URL(window.location.href);
    const hasSubscriptionParams = url.searchParams.has("subscription_success") || 
                                 url.searchParams.has("subscription_id") ||
                                 url.searchParams.has("yearly_success") ||
                                 url.searchParams.has("yearly_upgraded");
                                 
    // If URL has subscription parameters, check more frequently
    if (hasSubscriptionParams) {
      console.log("Detected subscription parameters in URL, checking status more frequently");
      const additionalTimeouts = [
        setTimeout(() => checkSubscription(), 2000),
        setTimeout(() => checkSubscription(), 5000),
        setTimeout(() => checkSubscription(), 10000),
        setTimeout(() => setForceCheck(prev => prev + 1), 15000) // Force a re-render after 15s
      ];
      
      timeouts.push(...additionalTimeouts);
    }
    
    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, []);
  
  // This effect runs when forceCheck changes, forcing another check
  useEffect(() => {
    if (forceCheck > 0) {
      console.log("Performing forced subscription check");
      checkSubscription();
    }
  }, [forceCheck]);
  
  const handleRefresh = async () => {
    toast.info("Checking subscription status...");
    await checkSubscription();
    toast.success("Subscription status refreshed");
    
    // Force another check after a delay
    setTimeout(() => checkSubscription(), 2000);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (isSubscribed) {
    console.log("User is subscribed, showing premium badge", { tier: subscriptionTier });
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

  console.log("User is NOT subscribed, showing free tier badge", { usageCount, dailyLimitReached });
  
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
