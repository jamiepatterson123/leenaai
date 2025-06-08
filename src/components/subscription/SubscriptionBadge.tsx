
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const SubscriptionBadge = () => {
  const today = new Date();
  const formattedDate = format(today, 'MMMM d, yyyy');

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-slate-500">
        {formattedDate}
      </span>
    </div>
  );
};
