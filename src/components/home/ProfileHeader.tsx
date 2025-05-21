
import React, { useEffect } from "react";
import { format } from "date-fns";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { useSubscription } from "@/hooks/useSubscription";

interface ProfileHeaderProps {
  profile: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const { isSubscribed, checkSubscription } = useSubscription();
  
  // Check subscription status on mount and periodically to ensure it's up to date
  useEffect(() => {
    // Initial check
    checkSubscription();
    
    // Set up periodic check every minute
    const intervalId = setInterval(() => {
      checkSubscription();
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0 bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSubscribed 
            ? (profile?.first_name ? `Hello, ${profile.first_name}` : "Welcome!") 
            : "Welcome! You're on Leena's Free Plan"}
        </h1>
        {/* Date display - currently hidden
        {!isSubscribed && (
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        )}
        */}
      </div>
      
      <SubscriptionBadge />
    </div>
  );
};
