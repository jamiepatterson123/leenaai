
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { WeightChartConfig } from "./WeightChartConfig";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface WeightTrendChartProps {
  data: {
    weight: number | null;
    date: string;
  }[];
}

export const WeightTrendChart = ({ data }: WeightTrendChartProps) => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<{date: string; weight: number} | null>(null);
  const [editWeight, setEditWeight] = useState<number | string>("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_units")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (date: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to delete weight entries");
        return;
      }

      const { error } = await supabase
        .from("weight_history")
        .delete()
        .eq("user_id", user.id)
        .eq("recorded_at", date);

      if (error) throw error;

      // Invalidate and refetch both weightHistory and profile queries
      await queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      toast.success("Weight entry deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      toast.error("Failed to delete weight entry");
    }
  };

  const handleEdit = async () => {
    if (!selectedEntry || !editWeight) {
      toast.error("Invalid weight value");
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to edit weight entries");
        return;
      }

      const numericWeight = Number(editWeight);
      if (isNaN(numericWeight) || numericWeight <= 0) {
        toast.error("Please enter a valid weight");
        return;
      }

      const { error } = await supabase
        .from("weight_history")
        .update({ weight_kg: numericWeight })
        .eq("user_id", user.id)
        .eq("recorded_at", selectedEntry.date);

      if (error) throw error;

      // Invalidate and refetch relevant queries
      await queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
      
      toast.success("Weight entry updated successfully");
      setIsEditDialogOpen(false);
      setEditWeight("");
    } catch (error) {
      console.error("Error updating weight entry:", error);
      toast.error("Failed to update weight entry");
    }
  };

  const openDeleteDialog = (date: string, weight: number) => {
    setSelectedEntry({ date, weight });
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (date: string, weight: number) => {
    setSelectedEntry({ date, weight });
    setEditWeight(weight);
    setIsEditDialogOpen(true);
  };

  const preferredUnits = profile?.preferred_units || 'metric';
  
  const convertedData = data.map(entry => ({
    ...entry,
    weight: entry.weight !== null 
      ? preferredUnits === 'imperial' 
        ? Math.round(entry.weight * 2.20462 * 10) / 10
        : entry.weight
      : null
  })).filter((entry): entry is { weight: number; date: string } => 
    entry.weight !== null
  );

  return (
    <Card className="bg-white overflow-hidden">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-semibold">Weight Trend</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0"
              >
                <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs">
              <p>Track your weight changes over time to monitor progress toward your goals.</p>
              <p className="mt-2 text-sm text-muted-foreground">Tap on any data point to see details and manage your weight logs.</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <WeightChartConfig
          data={convertedData}
          preferredUnits={preferredUnits}
          isMobile={isMobile}
          onDelete={openDeleteDialog}
          onEdit={openEditDialog}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <h3 className="font-semibold text-lg">Edit Weight Entry</h3>
          {selectedEntry && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date: {format(new Date(selectedEntry.date), 'MMM dd, yyyy')}</p>
                <p className="text-sm text-muted-foreground mb-3">Time: {format(new Date(selectedEntry.date), 'h:mm a')}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="weight" className="text-sm font-medium">
                  Weight ({preferredUnits === 'metric' ? 'kg' : 'lbs'})
                </label>
                <input
                  id="weight"
                  type="number"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  min="1"
                  step="0.1"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this weight entry from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedEntry && handleDelete(selectedEntry.date)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
