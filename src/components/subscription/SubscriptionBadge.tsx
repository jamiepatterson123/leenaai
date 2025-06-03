
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';

export const SubscriptionBadge = () => {
  const {
    isSubscribed,
    trialActive,
    trialDaysRemaining,
    trialEndDate
  } = useSubscription();

  const today = new Date();
  const formattedDate = format(today, 'MMMM d, yyyy');

  if (isSubscribed) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Premium Plan
      </Badge>;
  }

  if (trialActive && trialEndDate) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Free Trial ({trialDaysRemaining} days left)
        </Badge>
        <span className="text-xs text-slate-500">
          Ends {format(trialEndDate, 'MMM d, yyyy')}
        </span>
      </div>
    );
  }
  
  return <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-slate-500">
        {formattedDate}
      </span>
    </div>;
};
