import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
export const SubscriptionBadge = () => {
  const {
    isSubscribed,
    usageCount,
    FREE_USAGE_LIMIT,
    usageRemaining
  } = useSubscription();
  if (isSubscribed) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Premium Plan
      </Badge>;
  }
  return <div className="flex flex-col items-end gap-1">
      
      <span className="text-xs text-slate-500">
        {usageRemaining} of {FREE_USAGE_LIMIT} uses remaining
      </span>
    </div>;
};