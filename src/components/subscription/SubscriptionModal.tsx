
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onOpenChange,
}) => {
  // No longer needed - return empty dialog for compatibility
  return (
    <Dialog open={false} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Not Available</DialogTitle>
          <DialogDescription>
            Subscription features have been removed.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
