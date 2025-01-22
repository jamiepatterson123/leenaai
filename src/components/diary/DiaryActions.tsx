import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useDiaryActions = (formattedDate: string) => {
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("food_diary")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Food entry deleted");
      queryClient.invalidateQueries({ queryKey: ["foodDiary", formattedDate] });
    } catch (error) {
      toast.error("Failed to delete food entry");
      console.error("Error deleting food entry:", error);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    try {
      const { error } = await supabase
        .from("weight_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Weight entry deleted");
      queryClient.invalidateQueries({ queryKey: ["weightHistory", formattedDate] });
    } catch (error) {
      toast.error("Failed to delete weight entry");
      console.error("Error deleting weight entry:", error);
    }
  };

  const handleUpdateCategory = async (id: string, category: string) => {
    try {
      const { error } = await supabase
        .from("food_diary")
        .update({ category })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Moved to ${category}`);
      queryClient.invalidateQueries({ queryKey: ["foodDiary", formattedDate] });
    } catch (error) {
      toast.error("Failed to update food category");
      console.error("Error updating food category:", error);
    }
  };

  return {
    handleDelete,
    handleDeleteWeight,
    handleUpdateCategory
  };
};