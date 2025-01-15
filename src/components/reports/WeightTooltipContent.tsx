import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { TooltipProps } from 'recharts';

export interface WeightTooltipContentProps {
  payload?: TooltipProps<number, string>['payload'];
  onDelete: (date: string) => void;
  preferredUnits: string;
  isMobile: boolean;
}

export const WeightTooltipContent: React.FC<WeightTooltipContentProps> = ({
  payload,
  onDelete,
  preferredUnits,
  isMobile,
}) => {
  if (!payload || !payload.length) return null;

  const data = payload[0].payload;
  const weight = payload[0].value;
  const date = data.date;

  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">
            {weight}
            {preferredUnits === 'metric' ? 'kg' : 'lbs'}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString()}
          </p>
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(date)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};