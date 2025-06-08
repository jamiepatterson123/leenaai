
import React from "react";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";

interface ProfileHeaderProps {
  profile: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile?.first_name ? `Hello, ${profile.first_name}` : "Welcome to Leena.ai"}
          </h1>
        </div>
        
        <SubscriptionBadge />
      </div>
    </div>
  );
};
