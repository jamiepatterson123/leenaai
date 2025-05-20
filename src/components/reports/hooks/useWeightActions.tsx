
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface WeightEntry {
  date: string;
  weight: number;
}

export const useWeightActions = () => {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WeightEntry | null>(null);
  const [editWeight, setEditWeight] = useState<number | string>("");

  const openDeleteDialog = (date: string, weight: number) => {
    setSelectedEntry({ date, weight });
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (date: string, weight: number) => {
    setSelectedEntry({ date, weight });
    setEditWeight(weight);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    
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
        .eq("recorded_at", selectedEntry.date);

      if (error) throw error;

      // Invalidate and refetch both weightHistory and profile queries
      await queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      toast.success("Weight entry deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedEntry(null);
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
      
      // Fetch preferred units to know if conversion is needed
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_units")
        .eq("user_id", user.id)
        .single();

      // If units are imperial, convert to kg for storage
      const weightToStore = profile?.preferred_units === 'imperial' 
        ? numericWeight / 2.20462 
        : numericWeight;

      const { error } = await supabase
        .from("weight_history")
        .update({ weight_kg: weightToStore })
        .eq("user_id", user.id)
        .eq("recorded_at", selectedEntry.date);

      if (error) throw error;

      // Invalidate and refetch relevant queries
      await queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
      
      toast.success("Weight entry updated successfully");
      setIsEditDialogOpen(false);
      setEditWeight("");
      setSelectedEntry(null);
    } catch (error) {
      console.error("Error updating weight entry:", error);
      toast.error("Failed to update weight entry");
    }
  };

  return {
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
  };
};
