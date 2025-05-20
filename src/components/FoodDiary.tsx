
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NutritionCard } from "./NutritionCard";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEffect } from "react";
import { triggerSuccessConfetti } from "@/utils/confetti";

interface FoodDiaryProps {
  selectedDate: Date;
}

interface FoodGroup {
  mealName: string;
  mealId: string | null;
  foods: any[];
}

export const FoodDiary = ({ selectedDate }: FoodDiaryProps) => {
  const queryClient = useQueryClient();
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  // Set up real-time listeners for food diary changes
  useEffect(() => {
    const foodDiaryChannel = supabase
      .channel('food_diary_changes')
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

    return () => {
      supabase.removeChannel(foodDiaryChannel);
    };
  }, [queryClient]);

  const { data: foodEntries, isLoading, error } = useQuery({
    queryKey: ["foodDiary", formattedDate],
    queryFn: async () => {
      console.log("Fetching food entries for date:", formattedDate);
      
      // Check authentication status
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

      console.log("Fetched food entries:", data);
      return data || [];
    },
    staleTime: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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

  const handleUpdateCategory = async (id: string, category: string) => {
    try {
      const { error } = await supabase
        .from("food_diary")
        .update({ category })
        .eq("id", id);

      if (error) throw error;

      // Trigger confetti animation when food category is updated
      triggerSuccessConfetti();
      
      toast.success(`Moved to ${category}`);
      queryClient.invalidateQueries({ queryKey: ["foodDiary", formattedDate] });
    } catch (error) {
      toast.error("Failed to update food category");
      console.error("Error updating food category:", error);
    }
  };

  const handleUpdateMealName = async (mealId: string, mealName: string) => {
    try {
      const { error } = await supabase
        .from("food_diary")
        .update({ meal_name: mealName })
        .eq("meal_id", mealId);

      if (error) throw error;
      
      toast.success(`Meal name updated`);
      queryClient.invalidateQueries({ queryKey: ["foodDiary", formattedDate] });
    } catch (error) {
      toast.error("Failed to update meal name");
      console.error("Error updating meal name:", error);
    }
  };

  // Log any query errors
  if (error) {
    console.error("Query error:", error);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading food diary...
        </div>
      </div>
    );
  }

  // Group foods by meal_id and meal_name
  const groupedFoods: FoodGroup[] = [];
  
  if (foodEntries && foodEntries.length > 0) {
    // First create a map of meal_id to foods
    const mealMap = new Map<string, any[]>();
    
    foodEntries.forEach(entry => {
      // Generate a pseudo ID for entries without meal_id
      const mealId = entry.meal_id || `single-${entry.id}`;
      
      if (!mealMap.has(mealId)) {
        mealMap.set(mealId, []);
      }
      
      mealMap.get(mealId)!.push({
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
      });
    });
    
    // Convert the map to an array of FoodGroup objects
    mealMap.forEach((foods, mealId) => {
      // Get the meal name from the first food in the group
      const firstEntry = foodEntries.find(entry => 
        entry.meal_id === mealId || (!entry.meal_id && `single-${entry.id}` === mealId)
      );
      
      const mealName = firstEntry?.meal_name || 
                      (foods.length === 1 ? foods[0].name : "Unnamed meal");
      
      groupedFoods.push({
        mealId: mealId.startsWith('single-') ? null : mealId,
        mealName,
        foods
      });
    });
  }

  console.log("Grouped foods:", groupedFoods);

  return (
    <div className="w-full">
      {groupedFoods.map((group, index) => (
        <div key={group.mealId || `group-${index}`} className="mb-6">
          <NutritionCard 
            foods={group.foods} 
            onDelete={handleDelete} 
            onUpdateCategory={handleUpdateCategory}
            selectedDate={selectedDate}
            mealName={group.mealName}
            mealId={group.mealId}
            onUpdateMealName={handleUpdateMealName}
          />
        </div>
      ))}
      
      {groupedFoods.length === 0 && (
        <div className="text-center p-8 bg-card rounded-lg border">
          <p className="text-muted-foreground">No food entries for this date</p>
        </div>
      )}
    </div>
  );
};
