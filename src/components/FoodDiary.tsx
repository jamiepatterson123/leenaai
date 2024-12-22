import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NutritionCard } from "./NutritionCard";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

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

  if (isLoading) {
    return <div>Loading food diary...</div>;
  }

  const foods = foodEntries.map((entry) => ({
    id: entry.id,
    name: entry.food_name,
    weight_g: entry.weight_g,
    nutrition: {
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    },
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Today's Food Diary</h2>
      <NutritionCard foods={foods} onDelete={handleDelete} />
    </div>
  );
};