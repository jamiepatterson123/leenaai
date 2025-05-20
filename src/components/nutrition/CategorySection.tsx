
import React from "react";
import { FoodItem } from "./FoodItem";
import { MealSection } from "./MealSection";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CategorySectionProps {
  category: string;
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    category?: string;
    created_at?: string;
    meal_name?: string;
    meal_id?: string;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  mealCategories: string[];
  showEmpty?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  foods,
  onDelete,
  onUpdateCategory,
  mealCategories,
  showEmpty = false,
}) => {
  // Only render the section if there are foods in this category or showEmpty is true
  if (foods.length === 0 && !showEmpty) {
    return null;
  }

  // Group foods by meal_id
  const mealGroups: Record<string, typeof foods> = {};
  const ungroupedFoods: typeof foods = [];

  foods.forEach((food) => {
    if (food.meal_id) {
      if (!mealGroups[food.meal_id]) {
        mealGroups[food.meal_id] = [];
      }
      mealGroups[food.meal_id].push(food);
    } else {
      ungroupedFoods.push(food);
    }
  });

  const totalCalories = foods?.reduce(
    (total, food) => total + (food.nutrition?.calories || 0),
    0
  ) || 0;

  return (
    <Collapsible defaultOpen={true} className="w-full">
      <CollapsibleTrigger className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10 w-full group">
        <div className="flex justify-between items-center w-full">
          <span className="font-medium">{category}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm">{totalCalories.toFixed(0)} kcal</span>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="w-full pl-2 pr-0">
        {/* Render meal sections */}
        {Object.entries(mealGroups).map(([mealId, mealFoods]) => (
          <MealSection
            key={mealId}
            mealId={mealId}
            mealName={mealFoods[0]?.meal_name || "Unlabeled Meal"}
            foods={mealFoods.map(food => ({
              id: food.id,
              name: food.name,
              weight_g: food.weight_g,
              nutrition: food.nutrition,
              category: food.category,
              created_at: food.created_at
            }))}
            onDelete={onDelete}
            onUpdateCategory={onUpdateCategory}
            mealCategories={mealCategories}
          />
        ))}

        {/* Render individual food items (for backward compatibility) */}
        {ungroupedFoods.length > 0 && (
          <div className="space-y-2 mt-2 w-full">
            {ungroupedFoods.map((food) => (
              <FoodItem
                key={food.id}
                food={food}
                onDelete={onDelete}
                onUpdateCategory={onUpdateCategory}
                mealCategories={mealCategories}
              />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
