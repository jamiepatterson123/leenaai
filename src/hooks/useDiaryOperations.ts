import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDiaryOperations = () => {
  const queryClient = useQueryClient();

  const handleDelete = async (id: string, entryType: "food" | "weight") => {
    try {
      const { error } = await supabase
        .from(entryType === "weight" ? "weight_history" : "food_diary")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ 
        queryKey: [entryType === "weight" ? "weightHistory" : "foodDiary"] 
      });
      
      toast.success(`${entryType === "weight" ? "Weight" : "Food"} entry deleted successfully`);
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const handleUpdateCategory = async (id: string, category: string) => {
    try {
      const { error } = await supabase
        .from("food_diary")
        .update({ category: category.toLowerCase() })
        .eq("id", id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["foodDiary"] });
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  return {
    handleDelete,
    handleUpdateCategory
  };
};