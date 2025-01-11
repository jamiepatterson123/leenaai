import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface WeightTooltipContentProps {
  value: number;
  date: string;
  unitLabel: string;
  onDelete: (date: string) => void;
}

export const WeightTooltipContent = ({
  value,
  date,
  unitLabel,
  onDelete,
}: WeightTooltipContentProps) => {
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            Weight
          </span>
          <span className="font-bold">
            {value}{unitLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(date);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};