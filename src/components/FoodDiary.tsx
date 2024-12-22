import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NutritionCard } from "./NutritionCard";
import { toast } from "sonner";
import { format } from "date-fns";

export const FoodDiary = () => {
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

  if (isLoading) {
    return <div>Loading food diary...</div>;
  }

  const foods = foodEntries.map((entry) => ({
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
      <NutritionCard foods={foods} />
    </div>
  );
};