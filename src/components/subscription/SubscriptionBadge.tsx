
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
  const [lastChecked, setLastChecked] = useState(Date.now());
  
  // Immediately check subscription status on mount with multiple retry attempts
  useEffect(() => {
    console.log("SubscriptionBadge: Initial subscription check");
    
    // Check immediately on component mount
    checkSubscription().then(() => setLastChecked(Date.now()));
    
    // Check again after short delays to catch any state changes
    const timeouts = [
      setTimeout(() => {
        console.log("SubscriptionBadge: First delayed check");
        checkSubscription().then(() => setLastChecked(Date.now()));
      }, 1000),
      setTimeout(() => {
        console.log("SubscriptionBadge: Second delayed check");
        checkSubscription().then(() => setLastChecked(Date.now()));
      }, 3000),
      setTimeout(() => {
        console.log("SubscriptionBadge: Third delayed check");
        checkSubscription().then(() => setLastChecked(Date.now()));
      }, 7000)
    ];
    
    // Check if URL has subscription-related parameters
    const url = new URL(window.location.href);
    const hasSubscriptionParams = url.searchParams.has("subscription_success") || 
                               url.searchParams.has("subscription_id") ||
                               url.searchParams.has("yearly_success") ||
                               url.searchParams.has("yearly_upgraded");
                               
    // If URL has subscription parameters, check more frequently
    if (hasSubscriptionParams) {
      console.log("SubscriptionBadge: Detected subscription parameters in URL, checking status more frequently");
      const additionalTimeouts = [
        setTimeout(() => checkSubscription().then(() => setLastChecked(Date.now())), 500),
        setTimeout(() => checkSubscription().then(() => setLastChecked(Date.now())), 2000),
        setTimeout(() => checkSubscription().then(() => setLastChecked(Date.now())), 5000),
        setTimeout(() => checkSubscription().then(() => setLastChecked(Date.now())), 10000),
        setTimeout(() => setForceCheck(prev => prev + 1), 12000) // Force a re-render
      ];
      
      timeouts.push(...additionalTimeouts);
    }
    
    // Set up periodic check every 30 seconds
    const intervalId = setInterval(() => {
      console.log("SubscriptionBadge: Periodic check");
      checkSubscription().then(() => setLastChecked(Date.now()));
    }, 30000);
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      clearInterval(intervalId);
    };
  }, []);
  
  // This effect runs when forceCheck changes or URL parameters change
  useEffect(() => {
    if (forceCheck > 0) {
      console.log(`SubscriptionBadge: Force check #${forceCheck}`);
      checkSubscription().then(() => setLastChecked(Date.now()));
      
      // Additional delayed checks
      setTimeout(() => {
        console.log(`SubscriptionBadge: Force delayed check #${forceCheck}`);
        checkSubscription().then(() => setLastChecked(Date.now()));
      }, 2000);
    }
  }, [forceCheck]);
  
  // Also check for URL parameters changes
  useEffect(() => {
    const checkUrlParams = () => {
      const url = new URL(window.location.href);
      return url.search; // This includes all parameters
    };
    
    const urlParams = checkUrlParams();
    
    // If URL parameters change, trigger a subscription check
    const intervalId = setInterval(() => {
      const newUrlParams = checkUrlParams();
      if (newUrlParams !== urlParams) {
        console.log("URL parameters changed, checking subscription");
        checkSubscription().then(() => setLastChecked(Date.now()));
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleRefresh = async () => {
    toast.info("Checking subscription status...");
    await checkSubscription();
    toast.success("Subscription status refreshed");
    setLastChecked(Date.now());
    
    // Force another check after a delay
    setTimeout(() => {
      checkSubscription().then(() => setLastChecked(Date.now()));
      setForceCheck(prev => prev + 1);
    }, 2000);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (isSubscribed) {
    console.log("SubscriptionBadge: User is subscribed, showing premium badge", { 
      tier: subscriptionTier,
      lastChecked: new Date(lastChecked).toISOString() 
    });
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

  console.log("SubscriptionBadge: User is NOT subscribed, showing free tier badge", { 
    usageCount, 
    dailyLimitReached,
    lastChecked: new Date(lastChecked).toISOString()
  });
  
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
