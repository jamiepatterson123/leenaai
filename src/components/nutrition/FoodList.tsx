import React from "react";
import { Button } from "../ui/button";
import { Trash2, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FoodListProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    category?: string;
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
    Uncategorized: foods.filter(food => !food.category),
  };

  const FoodItem = ({ food }: { food: typeof foods[0] }) => (
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {mealCategories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => onUpdateCategory(food.id, category)}
              >
                Move to {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
  );

  return (
    <div className="space-y-3">
      {Object.entries(foodsByCategory).map(([category, categoryFoods]) => (
        <div key={category} className="space-y-2">
          <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10">
            <span className="font-medium">{category}</span>
            <span>
              {categoryFoods.reduce(
                (total, food) => total + (food.nutrition?.calories || 0),
                0
              )}{" "}
              kcal
            </span>
          </div>
          {categoryFoods.map((food) => (
            <FoodItem key={food.id} food={food} />
          ))}
        </div>
      ))}
    </div>
  );
};