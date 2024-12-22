import React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NutritionCard } from "./NutritionCard";
import { toast } from "sonner";
import { format } from "date-fns";

export const FoodDiary = () => {
  const queryClient = useQueryClient();

  const { data: foodEntries, isLoading } = useQuery({
    queryKey: ["foodDiary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_diary")
        .select("*")
        .eq("date", format(new Date(), "yyyy-MM-dd"))
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load food diary");
        throw error;
      }

      return data || [];
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, category }: { id: string; category: string }) => {
      const { error } = await supabase
        .from("food_diary")
        .update({ category })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodDiary"] });
      toast.success("Food entry updated");
    },
    onError: () => {
      toast.error("Failed to update food entry");
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
      queryClient.invalidateQueries({ queryKey: ["foodDiary"] });
    } catch (error) {
      toast.error("Failed to delete food entry");
      console.error("Error deleting food entry:", error);
    }
  };

  const handleUpdateCategory = (foodId: string, category: string) => {
    updateCategoryMutation.mutate({ id: foodId, category });
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
    <NutritionCard
      foods={foods}
      onDelete={handleDelete}
      onUpdateCategory={handleUpdateCategory}
    />
  );
};