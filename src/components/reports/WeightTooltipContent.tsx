import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Payload } from 'recharts/types/component/DefaultTooltipContent';

export interface WeightTooltipContentProps {
  payload?: Payload<any, any>[];
  onDelete: (date: string) => void;
  preferredUnits: string;
  isMobile: boolean;
}

export const WeightTooltipContent: React.FC<WeightTooltipContentProps> = ({
  payload,
  onDelete,
  preferredUnits,
  isMobile
}) => {
  if (!payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;
  const date = new Date(data.date).toLocaleDateString();
  const weight = data.weight;
  const unit = preferredUnits === 'metric' ? 'kg' : 'lbs';

  return (
    <div className="bg-white p-2 border rounded shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">{date}</p>
          <p>{`${weight} ${unit}`}</p>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(data.date)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};