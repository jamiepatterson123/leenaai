import React from "react";
import { CategorySection } from "./CategorySection";

interface FoodListProps {
  foods: Array<{
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
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ 
  foods, 
  onDelete,
  onUpdateCategory 
}) => {
  const mealCategories = ["breakfast", "lunch", "dinner", "snacks", "uncategorized"];
  
  const foodsByCategory = {
    breakfast: foods.filter(food => food.category?.toLowerCase() === "breakfast"),
    lunch: foods.filter(food => food.category?.toLowerCase() === "lunch"),
    dinner: foods.filter(food => food.category?.toLowerCase() === "dinner"),
    snacks: foods.filter(food => food.category?.toLowerCase() === "snacks"),
    uncategorized: foods.filter(food => !food.category || food.category.toLowerCase() === "uncategorized"),
  };

  return (
    <div className="space-y-4">
      {mealCategories.map((category) => (
        <CategorySection
          key={category}
          category={category.charAt(0).toUpperCase() + category.slice(1)}
          foods={foodsByCategory[category] || []}
          onDelete={onDelete}
          onUpdateCategory={onUpdateCategory}
          mealCategories={mealCategories}
        />
      ))}
    </div>
  );
};