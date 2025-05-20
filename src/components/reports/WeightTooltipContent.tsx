
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { TooltipProps } from 'recharts';
import { format } from 'date-fns';

interface WeightTooltipContentProps extends Omit<TooltipProps<number, string>, 'content'> {
  onDelete: (date: string, weight: number) => void;
  onEdit: (date: string, weight: number) => void;
  preferredUnits: string;
  isMobile: boolean;
}

export const WeightTooltipContent: React.FC<WeightTooltipContentProps> = ({
  active,
  payload,
  onDelete,
  onEdit,
  preferredUnits,
  isMobile
}) => {
  if (!active || !payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;
  const date = format(new Date(data.date), 'MM/dd/yyyy');
  const time = format(new Date(data.date), 'h:mm a');
  const weight = data.weight;
  const unit = preferredUnits === 'metric' ? 'kg' : 'lbs';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(data.date, weight);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(data.date, weight);
  };

  return (
    <div className="bg-white p-4 border rounded-lg shadow-lg">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-base text-center">Weight Log</h3>
        
        <div className="grid gap-1">
          <p className="font-medium text-base">{`${weight} ${unit}`}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
          <p className="text-sm text-muted-foreground">{time}</p>
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
