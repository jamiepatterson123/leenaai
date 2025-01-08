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
  const mealCategories = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  
  const foodsByCategory = {
    Breakfast: foods.filter(food => food.category === "Breakfast"),
    Lunch: foods.filter(food => food.category === "Lunch"),
    Dinner: foods.filter(food => food.category === "Dinner"),
    Snacks: foods.filter(food => food.category === "Snacks"),
    Uncategorized: foods.filter(food => !food.category || food.category === "uncategorized"),
  };

  return (
    <div className="space-y-4">
      {[...mealCategories, "Uncategorized"].map((category) => (
        <CategorySection
          key={category}
          category={category}
          foods={foodsByCategory[category] || []}
          onDelete={onDelete}
          onUpdateCategory={onUpdateCategory}
          mealCategories={mealCategories}
        />
      ))}
    </div>
  );
};