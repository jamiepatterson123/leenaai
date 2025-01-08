import React from "react";
import { Button } from "../ui/button";
import { Trash2, ChevronDown } from "lucide-react";
import { format } from "date-fns";
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

  const FoodItem = ({ food }: { food: typeof foods[0] }) => (
    <div
      key={food.id}
      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-secondary/30 rounded-lg backdrop-blur-sm border border-border/10 space-y-2 sm:space-y-0"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="font-medium capitalize">{food.name}</span>
          <span className="text-sm text-muted-foreground">
            {food.weight_g}g
          </span>
          {food.created_at && (
            <span className="text-xs text-muted-foreground ml-auto sm:ml-2">
              {format(new Date(food.created_at), "h:mm a")}
            </span>
          )}
        </div>
        {food.nutrition && (
          <div className="text-sm text-muted-foreground space-x-2">
            <span>{food.nutrition.protein}g protein</span>
            <span>•</span>
            <span>{food.nutrition.carbs}g carbs</span>
            <span>•</span>
            <span>{food.nutrition.fat}g fat</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
        {food.nutrition && (
          <span className="text-sm font-medium">{food.nutrition.calories} kcal</span>
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
    <div className="space-y-4">
      {[...mealCategories, "Uncategorized"].map((category) => (
        <div key={category} className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10">
            <span className="font-medium">{category}</span>
            <span className="text-sm">
              {foodsByCategory[category]?.reduce(
                (total, food) => total + (food.nutrition?.calories || 0),
                0
              ) || 0}{" "}
              kcal
            </span>
          </div>
          <div className="space-y-2">
            {foodsByCategory[category]?.map((food) => (
              <FoodItem key={food.id} food={food} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};