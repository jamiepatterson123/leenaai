
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
  onUpdateWeight: (id: string, newWeight: number) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ 
  foods, 
  onDelete,
  onUpdateCategory,
  onUpdateWeight
}) => {
  const mealCategories = ["Breakfast", "Lunch", "Dinner", "Snacks", "Uncategorized"];
  
  const foodsByCategory = {
    Breakfast: foods.filter(food => food.category?.toLowerCase() === "breakfast"),
    Lunch: foods.filter(food => food.category?.toLowerCase() === "lunch"),
    Dinner: foods.filter(food => food.category?.toLowerCase() === "dinner"),
    Snacks: foods.filter(food => food.category?.toLowerCase() === "snacks"),
    Uncategorized: foods.filter(food => !food.category || food.category.toLowerCase() === "uncategorized"),
  };

  return (
    <div className="space-y-4 w-full">
      {mealCategories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          foods={foodsByCategory[category] || []}
          onDelete={onDelete}
          onUpdateCategory={onUpdateCategory}
          onUpdateWeight={onUpdateWeight}
          mealCategories={mealCategories}
          showEmpty={true}
        />
      ))}
    </div>
  );
};
