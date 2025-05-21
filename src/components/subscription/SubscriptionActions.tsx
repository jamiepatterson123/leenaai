
import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, RefreshCw, ArrowRight } from "lucide-react";

interface SubscriptionActionsProps {
  isSubscribed: boolean;
  redirectToCustomerPortal: () => void;
  handleRefresh: () => void;
}

export const SubscriptionActions: React.FC<SubscriptionActionsProps> = ({ 
  isSubscribed, 
  redirectToCustomerPortal, 
  handleRefresh 
}) => {
  if (isSubscribed) {
    return (
      <>
        <Button variant="outline" size="sm" className="text-xs h-8" onClick={redirectToCustomerPortal}>
          <CreditCard className="h-3 w-3 mr-2" />
          Manage Subscription
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={handleRefresh}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh Status
        </Button>
      </>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-xs h-8" 
      onClick={() => window.location.href = "https://buy.stripe.com/eVqaEYgDQ4Bgam54Dqe7m02"}
    >
      <ArrowRight className="h-3 w-3 mr-1" />
      Upgrade for unlimited photo logging
    </Button>
  );
};
