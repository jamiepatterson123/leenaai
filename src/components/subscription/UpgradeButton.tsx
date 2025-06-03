
import React from 'react';
import { ArrowUpCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useIsMobile } from '@/hooks/use-mobile';

export const UpgradeButton = () => {
  const { isSubscribed, hasAccess, trialActive, trialDaysRemaining, redirectToCheckout } = useSubscription();
  const isMobile = useIsMobile();
  
  // Don't show the button for subscribed users or on mobile (since the camera button serves that purpose)
  if (isSubscribed || isMobile) {
    return null;
  }
  
  // Show upgrade button if trial expired or trial is ending soon
  const showUpgrade = !hasAccess || (trialActive && trialDaysRemaining <= 3);
  
  if (!showUpgrade) {
    return null;
  }
  
  return (
    <button 
      onClick={() => redirectToCheckout()}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg 
        ${!hasAccess 
          ? 'bg-[#D946EF] text-white hover:bg-[#D946EF]/90' 
          : 'bg-white text-[#D946EF] border border-[#D946EF]/30 hover:bg-[#D946EF]/5'} 
        transition-all duration-200 transform hover:scale-105`}
    >
      <ArrowUpCircle className="h-5 w-5" />
      <span className="font-medium">
        {!hasAccess ? 'Upgrade Now' : 'Go Premium'}
      </span>
    </button>
  );
};
