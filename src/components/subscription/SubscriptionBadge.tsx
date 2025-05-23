
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionBadge = () => {
  const { isSubscribed, usageCount, FREE_USAGE_LIMIT, usageRemaining } = useSubscription();
  
  if (isSubscribed) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Premium Plan
      </Badge>
    );
  }
  
  return (
    <div className="flex flex-col items-end gap-1">
      <Badge variant="outline" className="bg-white text-slate-900 border-slate-200">
        Free Plan
      </Badge>
      <span className="text-xs text-slate-500">
        {usageRemaining} of {FREE_USAGE_LIMIT} uses remaining
      </span>
    </div>
  );
};
