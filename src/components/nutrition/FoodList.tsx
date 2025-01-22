import React from "react";
import { CategorySection } from "./CategorySection";

interface Food {
  id: string;
  name: string;
  weight_g: number;
  category?: string;
  created_at?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isWeightEntry?: boolean;
  weightKg?: number;
}

interface FoodListProps {
  foods: Food[];
  onDelete: (id: string) => void;
  onDeleteWeight: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ 
  foods, 
  onDelete,
  onDeleteWeight,
  onUpdateCategory 
}) => {
  const mealCategories = ["Breakfast", "Lunch", "Dinner", "Snacks", "Uncategorized", "Weight"];
  
  const foodsByCategory = {
    Breakfast: foods.filter(food => food.category?.toLowerCase() === "breakfast"),
    Lunch: foods.filter(food => food.category?.toLowerCase() === "lunch"),
    Dinner: foods.filter(food => food.category?.toLowerCase() === "dinner"),
    Snacks: foods.filter(food => food.category?.toLowerCase() === "snacks"),
    Uncategorized: foods.filter(food => !food.category || food.category.toLowerCase() === "uncategorized"),
    Weight: foods.filter(food => food.category?.toLowerCase() === "weight"),
  };

  return (
    <div className="space-y-4 w-full">
      {mealCategories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          foods={foodsByCategory[category] || []}
          onDelete={onDelete}
          onDeleteWeight={onDeleteWeight}
          onUpdateCategory={onUpdateCategory}
          mealCategories={mealCategories}
          showEmpty={true}
        />
      ))}
    </div>
  );
};