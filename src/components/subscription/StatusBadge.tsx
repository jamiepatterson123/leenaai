
import React from "react";
import { Star } from "lucide-react";

interface StatusBadgeProps {
  tier: string | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ tier }) => {
  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-3 py-1 rounded-full text-xs font-medium">
      <Star className="h-3 w-3" />
      <span>{tier === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}</span>
    </div>
  );
};
