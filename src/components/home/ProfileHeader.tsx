
import React, { useState, useEffect } from "react";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { useSubscription } from "@/hooks/useSubscription";

interface ProfileHeaderProps {
  profile: any;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const { isSubscribed, trialActive, trialDaysRemaining, hasAccess } = useSubscription();
  
  // Trial notification component
  const getTrialMessage = () => {
    if (isSubscribed) return null;
    
    if (!hasAccess) {
      return (
        <div className="text-center py-3 px-4 bg-red-50 text-red-800 rounded-md text-sm mb-4 border border-red-200">
          <div className="font-medium">Your free trial has ended</div>
          <div className="mt-1">
            Upgrade to premium to continue using Leena.ai
            <button 
              className="ml-2 font-medium underline hover:text-red-900" 
              onClick={() => window.open('https://buy.stripe.com/eVqaEYgDQ4Bgam54Dqe7m02', '_blank')}
            >
              Upgrade now
            </button>
          </div>
        </div>
      );
    }
    
    if (trialActive) {
      const isLastDays = trialDaysRemaining <= 3;
      const bgColor = isLastDays ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';
      const textColor = isLastDays ? 'text-amber-800' : 'text-blue-800';
      
      return (
        <div className={`text-center py-3 px-4 rounded-md text-sm mb-4 border ${bgColor} ${textColor}`}>
          <div className="font-medium">
            {trialDaysRemaining === 1 
              ? "Last day of your free trial!" 
              : `${trialDaysRemaining} days left in your free trial`
            }
          </div>
          {isLastDays && (
            <div className="mt-1">
              Upgrade now to keep unlimited access
              <button 
                className="ml-2 font-medium underline hover:opacity-80" 
                onClick={() => window.open('https://buy.stripe.com/eVqaEYgDQ4Bgam54Dqe7m02', '_blank')}
              >
                Upgrade to premium
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-4">
      {getTrialMessage()}
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
