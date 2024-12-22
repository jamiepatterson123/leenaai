import React from "react";
import { Button } from "../ui/button";
import { Trash2, ChevronDown } from "lucide-react";

interface FoodListProps {
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
  }>;
  onDelete: (id: string) => void;
}

export const FoodList: React.FC<FoodListProps> = ({ foods, onDelete }) => {
  const mealCategories = [
    { name: "Breakfast", calories: 855 },
    { name: "Lunch", calories: 567 },
    { name: "Dinner", calories: 1000 },
    { name: "Snacks", calories: 0 },
  ];

  return (
    <div className="space-y-3">
      {mealCategories.map((category) => (
        <div
          key={category.name}
          className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10 hover:bg-secondary/70 transition-colors cursor-pointer"
        >
          <span className="font-medium">{category.name}</span>
          <div className="flex items-center gap-2">
            <span>{category.calories} kcal</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      ))}

      {foods.map((food) => (
        <div
          key={food.id}
          className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg backdrop-blur-sm border border-border/10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="capitalize">{food.name}</span>
              <span className="text-sm text-muted-foreground">
                {food.weight_g}g
              </span>
            </div>
            {food.nutrition && (
              <span className="text-sm text-muted-foreground">
                {food.nutrition.protein}g protein, {food.nutrition.carbs}g carbs,{" "}
                {food.nutrition.fat}g fat
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {food.nutrition && (
              <span className="text-sm">{food.nutrition.calories} kcal</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(food.id)}
              className="h-8 w-8 text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};