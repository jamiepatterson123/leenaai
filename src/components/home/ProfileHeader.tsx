
import React, { useState, useEffect } from "react";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { useSubscription } from "@/hooks/useSubscription";

interface ProfileHeaderProps {
  profile: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const { isSubscribed, usageRemaining, FREE_USAGE_LIMIT, dailyLimitReached } = useSubscription();
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  
  // Calculate time until next day (midnight)
  useEffect(() => {
    if (!dailyLimitReached || isSubscribed) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeLeft = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        setTimeUntilReset(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilReset(`${minutes}m`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [dailyLimitReached, isSubscribed]);
  
  // Usage message component
  const getUsageMessage = () => {
    if (isSubscribed) return null;
    
    if (dailyLimitReached) {
      return (
        <div className="text-center py-2 px-4 bg-amber-50 text-amber-800 rounded-md text-sm mb-4 border border-amber-100">
          You've used all {FREE_USAGE_LIMIT} free uploads. Next free credit in {timeUntilReset}.
          <button 
            className="ml-2 font-medium underline hover:text-amber-900" 
            onClick={() => window.open('https://buy.stripe.com/eVqaEYgDQ4Bgam54Dqe7m02', '_blank')}
          >
            Upgrade to premium
          </button>
        </div>
      );
    } else {
      return (
        <div className="text-center py-2 px-4 bg-blue-50 text-blue-800 rounded-md text-sm mb-4 border border-blue-100">
          {usageRemaining} of {FREE_USAGE_LIMIT} free uploads remaining
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-4">
      {getUsageMessage()}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {isSubscribed 
              ? (profile?.first_name ? `Hello, ${profile.first_name}` : "Welcome!") 
              : `Welcome to Leena.ai`}
          </h1>
        </div>
        
        <SubscriptionBadge />
      </div>
    </div>
  );
};
