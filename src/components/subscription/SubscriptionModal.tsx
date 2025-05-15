
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Check } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { 
    isLoading, 
    usageCount, 
    freeUsesRemaining, 
    redirectToCheckout 
  } = useSubscription();

  const handleUpgrade = async () => {
    await redirectToCheckout();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Upgrade to Leena.ai Premium
          </DialogTitle>
          <DialogDescription>
            You've used {usageCount} out of your 10 free nutrition logs.
            {freeUsesRemaining <= 0 
              ? " Subscribe to continue tracking your nutrition!" 
              : ` You have ${freeUsesRemaining} free uses remaining.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="bg-secondary/20 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-4">Premium Benefits</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> 
                Unlimited nutrition tracking
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> 
                AI food photo analysis
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> 
                Detailed nutrition reports
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> 
                WhatsApp integration
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-bold">$10<span className="text-base font-normal text-muted-foreground">/month</span></div>
            <p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading || freeUsesRemaining <= 0}
          >
            {freeUsesRemaining > 0 ? "Continue Free Trial" : "Cancel"}
          </Button>
          <Button onClick={handleUpgrade} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Subscribe Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
