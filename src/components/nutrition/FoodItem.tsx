
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Trash2, ChevronDown, Check, X } from "lucide-react";
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
  onUpdateWeight: (id: string, newWeight: number) => void;
  mealCategories: string[];
}

export const FoodItem: React.FC<FoodItemProps> = ({ 
  food, 
  onDelete, 
  onUpdateCategory,
  onUpdateWeight,
  mealCategories 
}) => {
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(food.weight_g.toString());

  const handleWeightEdit = () => {
    setIsEditingWeight(true);
    setTempWeight(food.weight_g.toString());
  };

  const handleWeightSave = () => {
    const newWeight = parseFloat(tempWeight);
    if (!isNaN(newWeight) && newWeight > 0) {
      onUpdateWeight(food.id, newWeight);
    }
    setIsEditingWeight(false);
  };

  const handleWeightCancel = () => {
    setTempWeight(food.weight_g.toString());
    setIsEditingWeight(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-secondary/30 rounded-lg backdrop-blur-sm border border-border/10 space-y-2 sm:space-y-0">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="font-medium capitalize">{food.name}</span>
          <div className="flex items-center gap-1">
            {isEditingWeight ? (
              <>
                <Input
                  type="number"
                  value={tempWeight}
                  onChange={(e) => setTempWeight(e.target.value)}
                  className="w-16 h-6 text-sm px-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleWeightSave();
                    if (e.key === 'Escape') handleWeightCancel();
                  }}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleWeightSave}
                >
                  <Check className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleWeightCancel}
                >
                  <X className="h-3 w-3 text-red-600" />
                </Button>
              </>
            ) : (
              <span 
                className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                onClick={handleWeightEdit}
              >
                {food.weight_g}g
              </span>
            )}
          </div>
          {food.created_at && (
            <span className="text-xs text-muted-foreground ml-auto sm:ml-2">
              {format(new Date(food.created_at), "h:mm a")}
            </span>
          )}
        </div>
        {food.nutrition && (
          <div className="text-sm text-muted-foreground space-x-2">
            <span>{Math.round(food.nutrition.protein)}g protein</span>
            <span>•</span>
            <span>{Math.round(food.nutrition.carbs)}g carbs</span>
            <span>•</span>
            <span>{Math.round(food.nutrition.fat)}g fat</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
        {food.nutrition && (
          <span className="text-sm font-medium">{Math.round(food.nutrition.calories)} kcal</span>
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
};
