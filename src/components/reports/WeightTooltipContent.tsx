import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { TooltipProps } from 'recharts';
import { toast } from 'sonner';

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
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!active || !payload || !payload[0]) {
    return null;
  }

  const data = payload[0].payload;
  const date = new Date(data.date).toLocaleDateString();
  const weight = data.weight;
  const unit = preferredUnits === 'metric' ? 'kg' : 'lbs';

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(data.date);
      toast.success('Weight entry deleted successfully');
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      toast.error('Failed to delete weight entry');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg min-w-[200px]">
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-lg">{date}</p>
          <p className="text-muted-foreground">{`${weight} ${unit}`}</p>
        </div>
        <Button 
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete Entry'}
        </Button>
      </div>
    </div>
  );
};