
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';

export const SubscriptionBadge = () => {
  const {
    isSubscribed,
    isLoading,
    usageCount,
    FREE_USAGE_LIMIT,
    usageRemaining
  } = useSubscription();

  const today = new Date();
  const formattedDate = format(today, 'MMMM d, yyyy');

  if (isLoading) {
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        Loading...
      </Badge>;
  }

  if (isSubscribed) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Premium Plan
      </Badge>;
  }

  return <div className="flex flex-col items-end gap-1">
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Free Plan
      </Badge>
      <span className="text-xs text-slate-500">
        {formattedDate}
      </span>
    </div>;
};
