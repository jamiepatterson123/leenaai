
import React from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Loader2, Star, CreditCard } from "lucide-react";

export const SubscriptionBadge: React.FC = () => {
  const { 
    isLoading, 
    isSubscribed, 
    usageCount, 
    freeUsesRemaining, 
    redirectToCheckout,
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

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">{freeUsesRemaining}</span> of 10 free uses left
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-xs h-8"
        onClick={redirectToCheckout}
      >
        <Star className="h-3 w-3 mr-1" />
        Upgrade to Premium
      </Button>
    </div>
  );
};
