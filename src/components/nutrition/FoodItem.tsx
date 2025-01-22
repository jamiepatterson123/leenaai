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

interface FoodItemProps {
  food: {
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
  };
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  mealCategories: string[];
}

export const FoodItem: React.FC<FoodItemProps> = ({ 
  food, 
  onDelete, 
  onUpdateCategory,
  mealCategories 
}) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-secondary/30 rounded-lg backdrop-blur-sm border border-border/10 space-y-2 sm:space-y-0">
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