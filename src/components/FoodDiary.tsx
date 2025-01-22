import React from "react";
import { NutritionCard } from "@/components/NutritionCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { FoodDiaryEntry } from "@/types/food";

interface FoodDiaryProps {
  selectedDate: Date;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({ selectedDate }) => {
  const queryClient = useQueryClient();
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  // Fetch food diary entries
  const { data: foodData = [], isLoading: isFoodLoading } = useQuery({
    queryKey: ["foodDiary", formattedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: foodEntries, error: foodError } = await supabase
        .from("food_diary")
        .select("*")
        .eq("date", formattedDate)
        .eq("user_id", user.id);

      if (foodError) throw foodError;
      return foodEntries || [];
    },
  });

  // Fetch weight entries for the selected date
  const { data: weightData = [], isLoading: isWeightLoading } = useQuery({
    queryKey: ["weightHistory", formattedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: weightEntries, error: weightError } = await supabase
        .from("weight_history")
        .select("*")
        .eq("recorded_at::date", formattedDate)
        .eq("user_id", user.id);

      if (weightError) throw weightError;
      return weightEntries || [];
    },
  });

  // Transform weight entries to food diary format
  const weightAsFoodEntries = weightData.map(weight => ({
    id: weight.id,
    user_id: weight.user_id,
    food_name: `Weight Entry: ${weight.weight_kg} kg`,
    weight_g: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    date: formattedDate,
    category: "uncategorized",
    created_at: weight.created_at,
    state: "weight_entry"
  }));

  // Combine food and weight entries
  const allEntries = [...foodData, ...weightAsFoodEntries];

  const handleDelete = async (id: string) => {
    try {
      const entryToDelete = allEntries.find(entry => entry.id === id);
      if (!entryToDelete) return;

      if (entryToDelete.state === "weight_entry") {
        // Delete from weight_history
        const { error } = await supabase
          .from("weight_history")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        // Invalidate weight history queries
        await queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
        toast.success("Weight entry deleted successfully");
      } else {
        // Delete from food_diary
        const { error } = await supabase
          .from("food_diary")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        // Invalidate food diary queries
        await queryClient.invalidateQueries({ queryKey: ["foodDiary"] });
        toast.success("Food entry deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const handleUpdateCategory = async (id: string, category: string) => {
    try {
      const entryToUpdate = allEntries.find(entry => entry.id === id);
      if (!entryToUpdate || entryToUpdate.state === "weight_entry") return;

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

  if (isFoodLoading || isWeightLoading) {
    return <div>Loading...</div>;
  }

  return (
    <NutritionCard
      foods={allEntries}
      onDelete={handleDelete}
      onUpdateCategory={handleUpdateCategory}
      selectedDate={selectedDate}
    />
  );
};