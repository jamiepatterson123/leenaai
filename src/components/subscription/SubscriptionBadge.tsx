
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, CreditCard, Star } from "lucide-react";

export const SubscriptionBadge: React.FC = () => {
  const { 
    isLoading, 
    isSubscribed, 
    usageCount,
    dailyLimitReached,
    isWithinFirst24Hours,
    hoursUntilNextUse,
    redirectToCustomerPortal
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs">Checking subscription...</span>
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-3 py-1 rounded-full text-xs font-medium">
          <Star className="h-3 w-3" />
          <span>Premium</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8"
          onClick={redirectToCustomerPortal}
        >
          <CreditCard className="h-3 w-3 mr-2" />
          Manage Subscription
        </Button>
      </div>
    );
  }

  // Free tier badge
  let statusText = '';
  if (isWithinFirst24Hours) {
    statusText = `${5 - usageCount} of 5 free uploads left`;
  } else if (dailyLimitReached) {
    const hours = Math.ceil(hoursUntilNextUse);
    statusText = `Next upload in ${hours}h`;
  } else {
    statusText = "1 free upload available";
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <div className="text-xs text-muted-foreground text-left w-full">
        {statusText}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs h-8 border bg-white text-black border-transparent bg-clip-padding p-[1px]"
        style={{ 
          backgroundImage: "linear-gradient(white, white), linear-gradient(to right, #D946EF, #8B5CF6)", 
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box"
        }}
        onClick={() => window.location.href = "https://buy.stripe.com/eVq5kEafs8RweClb1Oe7m01"}
      >
        <ArrowRight className="h-3 w-3 mr-1" />
        Upgrade for unlimited photo logging
      </Button>
    </div>
  );
};
