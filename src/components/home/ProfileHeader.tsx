
import React from "react";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { useSubscription } from "@/hooks/useSubscription";

interface ProfileHeaderProps {
  profile: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const { isSubscribed, usageRemaining, FREE_USAGE_LIMIT } = useSubscription();
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0 bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSubscribed 
            ? (profile?.first_name ? `Hello, ${profile.first_name}` : "Welcome!") 
            : `Welcome to Leena.ai${usageRemaining > 0 ? ` (${usageRemaining}/${FREE_USAGE_LIMIT} free uses left)` : ""}`}
        </h1>
      </div>
      
      <SubscriptionBadge />
    </div>
  );
};
