
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { WeightChartConfig } from "./WeightChartConfig";
import { useWeightActions } from "./hooks/useWeightActions";
import { WeightEditDialog } from "./WeightEditDialog";
import { WeightDeleteDialog } from "./WeightDeleteDialog";

interface WeightTrendChartProps {
  data: {
    weight: number | null;
    date: string;
  }[];
}

export const WeightTrendChart = ({ data }: WeightTrendChartProps) => {
  const isMobile = useIsMobile();
  
  const {
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedEntry,
    editWeight,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setEditWeight,
    openDeleteDialog,
    openEditDialog,
    handleDelete,
    handleEdit
  } = useWeightActions();

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
      <WeightEditDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        entry={selectedEntry}
        editWeight={editWeight}
        onWeightChange={(value) => setEditWeight(value)}
        onSave={handleEdit}
        preferredUnits={preferredUnits}
      />

      {/* Delete Confirmation Dialog */}
      <WeightDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
      />
    </Card>
  );
};
