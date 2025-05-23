
import React from 'react';
import { Badge } from '@/components/ui/badge';

export const SubscriptionBadge = () => {
  // Simple mock badge that shows "Free Plan"
  return (
    <Badge variant="outline" className="bg-white text-slate-900 border-slate-200">
      Free Plan
    </Badge>
  );
};
