
import React from "react";
import { FoodItem } from "./FoodItem";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface MealSectionProps {
  mealName: string;
  mealId: string;
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    category?: string;
    created_at?: string;
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  mealCategories: string[];
}

export const MealSection: React.FC<MealSectionProps> = ({
  mealName,
  mealId,
  foods,
  onDelete,
  onUpdateCategory,
  mealCategories
}) => {
  // Calculate total nutrition for the meal
  const totalNutrition = foods.reduce(
    (total, food) => ({
      calories: total.calories + (food.nutrition?.calories || 0),
      protein: total.protein + (food.nutrition?.protein || 0),
      carbs: total.carbs + (food.nutrition?.carbs || 0),
      fat: total.fat + (food.nutrition?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <Collapsible defaultOpen={true} className="w-full mb-2">
      <CollapsibleTrigger className="flex justify-between items-center p-3 bg-secondary/80 rounded-lg backdrop-blur-sm border border-border/10 w-full group">
        <div className="flex justify-between items-center w-full">
          <span className="font-medium">{mealName}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">{totalNutrition.calories.toFixed(0)} kcal</span>
            <div className="hidden sm:flex text-xs text-muted-foreground space-x-2">
              <span>{totalNutrition.protein.toFixed(1)}g P</span>
              <span>•</span>
              <span>{totalNutrition.carbs.toFixed(1)}g C</span>
              <span>•</span>
              <span>{totalNutrition.fat.toFixed(1)}g F</span>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="w-full pl-2 pr-0">
        <div className="space-y-2 mt-2 w-full">
          {foods.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              onDelete={onDelete}
              onUpdateCategory={onUpdateCategory}
              mealCategories={mealCategories}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
