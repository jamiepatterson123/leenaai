import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NutritionCard } from "./NutritionCard";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";

export const FoodDiary = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date') || format(new Date(), "yyyy-MM-dd");

  const { data: foodEntries, isLoading } = useQuery({
    queryKey: ["foodDiary", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_diary")
        .select("*")
        .eq("date", selectedDate)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load food diary");
        throw error;
      }

      return data || [];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("food_diary")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Food entry deleted");
      queryClient.invalidateQueries({ queryKey: ["foodDiary", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["foodLoggedDays"] });
    } catch (error) {
      toast.error("Failed to delete food entry");
      console.error("Error deleting food entry:", error);
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
      queryClient.invalidateQueries({ queryKey: ["foodDiary", selectedDate] });
    } catch (error) {
      toast.error("Failed to update food category");
      console.error("Error updating food category:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading food diary...
        </div>
      </div>
    );
  }

  const foods = foodEntries.map((entry) => ({
    id: entry.id,
    name: entry.food_name,
    weight_g: entry.weight_g,
    category: entry.category,
    nutrition: {
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    },
  }));

  return (
    <div>
      <NutritionCard 
        foods={foods} 
        onDelete={handleDelete} 
        onUpdateCategory={handleUpdateCategory}
        selectedDate={selectedDate}
      />
    </div>
  );
};