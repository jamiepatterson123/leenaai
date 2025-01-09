import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NutritionCard } from "./NutritionCard";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEffect } from "react";

interface FoodDiaryProps {
  selectedDate: Date;
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

      toast.success(`Moved to ${category}`);
      queryClient.invalidateQueries({ queryKey: ["foodDiary", formattedDate] });
    } catch (error) {
      toast.error("Failed to update food category");
      console.error("Error updating food category:", error);
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

  const foods = foodEntries?.map((entry) => ({
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
  })) || [];

  console.log("Transformed foods data:", foods);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <NutritionCard 
        foods={foods} 
        onDelete={handleDelete} 
        onUpdateCategory={handleUpdateCategory}
        selectedDate={selectedDate}
      />
    </div>
  );
};