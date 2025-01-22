import React from "react";
import { format } from "date-fns";
import { NutritionCard } from "./NutritionCard";
import { useFoodDiaryData } from "@/hooks/useFoodDiaryData";
import { RealtimeUpdates } from "./diary/RealtimeUpdates";
import { useDiaryActions } from "./diary/DiaryActions";

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
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  const { foodEntries, weightEntry, isLoading } = useFoodDiaryData(selectedDate);
  const { handleDelete, handleDeleteWeight, handleUpdateCategory } = useDiaryActions(formattedDate);

  if (isLoading) {
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

  if (weightEntry) {
    foods.unshift({
      id: weightEntry.id,
      name: `Weight Entry: ${weightEntry.weight_kg} kg`,
      weight_g: weightEntry.weight_kg * 1000,
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

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <RealtimeUpdates />
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