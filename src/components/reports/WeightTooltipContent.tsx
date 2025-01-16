import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { TooltipProps } from 'recharts';

interface WeightTooltipContentProps extends Omit<TooltipProps<number, string>, 'content'> {
  onDelete: (date: string) => Promise<void>;
  preferredUnits: string;
  isMobile: boolean;
}

export const WeightTooltipContent: React.FC<WeightTooltipContentProps> = ({
  active,
  payload,
  onDelete,
  preferredUnits,
  isMobile
}) => {
  if (!active || !payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;
  const date = new Date(data.date).toLocaleDateString();
  const weight = data.weight;
  const unit = preferredUnits === 'metric' ? 'kg' : 'lbs';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await onDelete(data.date);
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">{date}</p>
          <p>{`${weight} ${unit}`}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};