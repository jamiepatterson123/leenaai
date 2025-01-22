import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NutritionCard } from "./NutritionCard";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEffect } from "react";

interface Food {
  id: string;
  name: string;
  weight_g: number;
  category?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isWeightEntry?: boolean;
  weightKg?: number;
}

interface FoodDiaryProps {
  selectedDate: Date;
}

export const FoodDiary = ({ selectedDate }: FoodDiaryProps) => {
  const queryClient = useQueryClient();
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  // Set up real-time listeners for food diary and weight history changes
  useEffect(() => {
    const foodDiaryChannel = supabase
      .channel('diary_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_diary'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['foodDiary'] });
          queryClient.invalidateQueries({ queryKey: ['calorieHistory'] });
          queryClient.invalidateQueries({ queryKey: ['macroHistory'] });
          queryClient.invalidateQueries({ queryKey: ['mealDistribution'] });
        }
      )
      .subscribe();

    const weightChannel = supabase
      .channel('weight_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_history'
        },
        (payload) => {
          console.log('Weight update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(foodDiaryChannel);
      supabase.removeChannel(weightChannel);
    };
  }, [queryClient]);

  const { data: foodEntries, isLoading: isLoadingFood, error: foodError } = useQuery({
    queryKey: ["foodDiary", formattedDate],
    queryFn: async () => {
      console.log("Fetching food entries for date:", formattedDate);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user?.id);
      
      if (!user) {
        console.error("No authenticated user found");
        toast.error("Please log in to view your food diary");
        return [];
      }

      const { data, error } = await supabase
        .from("food_diary")
        .select("*")
        .eq("date", formattedDate)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching food entries:", error);
        toast.error("Failed to load food diary");
        throw error;
      }

      return data || [];
    },
  });

  const { data: weightEntry, isLoading: isLoadingWeight } = useQuery({
    queryKey: ["weightHistory", formattedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("weight_history")
        .select("*")
        .eq("recorded_at", formattedDate)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching weight entry:", error);
        return null;
      }

      return data;
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

  if (isLoadingFood || isLoadingWeight) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading diary entries...
        </div>
      </div>
    );
  }

  const foods: Food[] = foodEntries?.map((entry) => ({
    id: entry.id,
    name: entry.food_name,
    weight_g: entry.weight_g,
    category: entry.category || "Uncategorized",
    nutrition: {
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    },
  })) || [];

  // Add weight entry to foods array if it exists
  if (weightEntry) {
    foods.unshift({
      id: weightEntry.id,
      name: `Weight Entry: ${weightEntry.weight_kg} kg`,
      weight_g: weightEntry.weight_kg * 1000, // Convert to grams for consistency
      category: "Uncategorized",
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      isWeightEntry: true,
      weightKg: weightEntry.weight_kg,
    });
  }

  console.log("Transformed foods data:", foods);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <NutritionCard 
        foods={foods} 
        onDelete={handleDelete}
        onDeleteWeight={handleDeleteWeight}
        onUpdateCategory={handleUpdateCategory}
        selectedDate={selectedDate}
      />
    </div>
  );
};