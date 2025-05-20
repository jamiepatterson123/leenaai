
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface WeightEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry: { date: string; weight: number } | null;
  editWeight: number | string;
  onWeightChange: (value: string) => void;
  onSave: () => void;
  preferredUnits: string;
}

export const WeightEditDialog: React.FC<WeightEditDialogProps> = ({
  isOpen,
  onClose,
  entry,
  editWeight,
  onWeightChange,
  onSave,
  preferredUnits
}) => {
  if (!entry) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <h3 className="font-semibold text-lg">Edit Weight Entry</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date: {format(new Date(entry.date), 'MMM dd, yyyy')}</p>
            <p className="text-sm text-muted-foreground mb-3">Time: {format(new Date(entry.date), 'h:mm a')}</p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="weight" className="text-sm font-medium">
              Weight ({preferredUnits === 'metric' ? 'kg' : 'lbs'})
            </label>
            <input
              id="weight"
              type="number"
              value={editWeight}
              onChange={(e) => onWeightChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              min="1"
              step="0.1"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
