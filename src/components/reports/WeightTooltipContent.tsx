import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
  isMobile
}) => {
  if (!payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;
  const date = new Date(data.date).toLocaleDateString();
  const weight = data.weight;
  const unit = preferredUnits === 'metric' ? 'kg' : 'lbs';

  const handleDelete = async () => {
    try {
      await onDelete(data.date);
      toast.success('Weight entry deleted');
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      toast.error('Failed to delete weight entry');
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