import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { TooltipProps } from "recharts";

interface WeightTooltipContentProps extends TooltipProps<number, string> {
  unit: string;
  onDelete: (date: string) => void;
  isMobile: boolean;
}

export const WeightTooltipContent = ({
  active,
  payload,
  unit,
  onDelete,
  isMobile,
}: WeightTooltipContentProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  const weight = data.weight;
  const date = data.date;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-sm">{date}</p>
          <p className="text-sm">{`${weight} ${unit}`}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {isMobile && (
        <p className="text-xs text-muted-foreground mt-2">
          Tap the delete button to remove this entry
        </p>
      )}
    </div>
  );
};