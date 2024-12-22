import React from "react";
import { NutritionCard } from "@/components/NutritionCard";
import { format } from "date-fns";

interface FoodAnalysisProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    category?: string;
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
}

export const FoodAnalysis = ({ foods, onDelete, onUpdateCategory }: FoodAnalysisProps) => {
  return (
    <div className="space-y-6">
      <NutritionCard 
        foods={foods} 
        onDelete={onDelete} 
        onUpdateCategory={onUpdateCategory}
        selectedDate={format(new Date(), "yyyy-MM-dd")}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Meal Distribution</h3>
          {/* Add meal distribution chart here */}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Nutrient Breakdown</h3>
          {/* Add nutrient breakdown chart here */}
        </div>
      </div>
    </div>
  );
};