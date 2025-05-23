
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { useSubscription } from "@/hooks/useSubscription";

interface ProfileHeaderProps {
  profile: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const { isSubscribed, checkSubscription } = useSubscription();
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [lastChecked, setLastChecked] = useState(Date.now());
  
  // Ultra-aggressive subscription status checking
  useEffect(() => {
    // Immediate check on mount
    console.log("ProfileHeader: Checking subscription on mount");
    checkSubscription().then(() => setLastChecked(Date.now()));
    
    // Check in sequence with increasing delays to catch any webhooks or redirects
    const timeouts = [
      setTimeout(() => {
        console.log("ProfileHeader: First delayed subscription check");
        checkSubscription().then(() => setLastChecked(Date.now()));
      }, 1000),
      
      setTimeout(() => {
        console.log("ProfileHeader: Second delayed subscription check");
        checkSubscription().then(() => setLastChecked(Date.now()));
      }, 3000),
      
      setTimeout(() => {
        console.log("ProfileHeader: Third delayed subscription check");
        checkSubscription().then(() => setLastChecked(Date.now()));
      }, 7000),
      
      setTimeout(() => {
        console.log("ProfileHeader: Fourth delayed subscription check");
        checkSubscription().then(() => setLastChecked(Date.now()));
      }, 15000),
      
      // Force component re-render even if state hasn't changed
      setTimeout(() => {
        console.log("ProfileHeader: Forcing re-render");
        setRefreshCounter(c => c + 1);
      }, 10000)
    ];
    
    // Set up periodic check every 20 seconds
    const intervalId = setInterval(() => {
      console.log("ProfileHeader: Periodic subscription check");
      checkSubscription().then(() => setLastChecked(Date.now()));
    }, 20000);
    
    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearInterval(intervalId);
    };
  }, []);
  
  // Check if URL has subscription parameters and perform additional checks
  useEffect(() => {
    const url = new URL(window.location.href);
    const hasSubscriptionParams = 
      url.searchParams.has("subscription_success") || 
      url.searchParams.has("subscription_id") ||
      url.searchParams.has("yearly_success") ||
      url.searchParams.has("yearly_upgraded");
      
    if (hasSubscriptionParams) {
      console.log("ProfileHeader: Detected subscription parameters in URL, checking status");
      
      // Multiple checks to ensure we catch the subscription update
      const paramTimeouts = [
        setTimeout(() => {
          checkSubscription().then(() => setLastChecked(Date.now()));
        }, 500),
        setTimeout(() => {
          checkSubscription().then(() => setLastChecked(Date.now()));
        }, 2500),
        setTimeout(() => {
          checkSubscription().then(() => setLastChecked(Date.now()));
        }, 5000),
        setTimeout(() => {
          setRefreshCounter(c => c + 1);
        }, 6000)
      ];
      
      return () => paramTimeouts.forEach(t => clearTimeout(t));
    }
  }, [window.location.href]);
  
  // This effect runs when refreshCounter changes to force a re-render
  useEffect(() => {
    if (refreshCounter > 0) {
      console.log(`ProfileHeader: Refresh counter changed (${refreshCounter}), checking subscription`);
      checkSubscription().then(() => setLastChecked(Date.now()));
    }
  }, [refreshCounter]);
  
  // Add a manual check function that can be triggered by user action
  const forceCheck = () => {
    console.log("ProfileHeader: Manual subscription check triggered");
    checkSubscription().then(() => {
      setLastChecked(Date.now());
      setRefreshCounter(c => c + 1);
    });
  };
  
  console.log("ProfileHeader: Rendering with subscription status:", { 
    isSubscribed, 
    lastChecked: new Date(lastChecked).toISOString(),
    refreshCounter
  });
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0 bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSubscribed 
            ? (profile?.first_name ? `Hello, ${profile.first_name}` : "Welcome!") 
            : "Welcome! You're on Leena's Free Plan"}
        </h1>
      </div>
      
      <SubscriptionBadge />
    </div>
  );
};
