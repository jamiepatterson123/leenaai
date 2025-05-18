
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FoodItemProps {
  food: {
    id: string;
    name: string;
    weight_g?: number;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    category?: string;
  };
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  mealCategories: string[];
}

export const FoodItem: React.FC<FoodItemProps> = ({
  food,
  onDelete,
  onUpdateCategory,
  mealCategories,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(food.id);
  };

  const getNutrientInfo = (nutrient: string) => {
    switch (nutrient) {
      case "calories":
        return "Calories are units of energy that fuel your body's functions. Your total caloric intake affects weight management and energy levels.";
      case "protein":
        return "Protein is essential for muscle repair and growth. It helps with recovery after exercise and keeps you feeling fuller longer.";
      case "carbs":
        return "Carbohydrates are your body's primary energy source, especially important for high-intensity physical activities.";
      case "fat":
        return "Dietary fat is essential for hormone regulation, nutrient absorption, and brain function. Healthy fats are an important part of a balanced diet.";
      default:
        return "This nutrient is an important part of your daily nutrition tracking.";
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/20 gap-3 hover:border-border/40 transition-all">
      <div className="flex-grow min-w-0">
        <Popover>
          <PopoverTrigger asChild>
            <h3 className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors">
              {food.name}
            </h3>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">Food Information</h4>
              <p className="text-sm text-muted-foreground">
                {food.name} ({food.weight_g}g) contains various nutrients that contribute to your daily nutritional goals. 
                Each food tracked helps build a complete picture of your diet quality and macronutrient balance.
              </p>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="text-xs text-muted-foreground mt-1 flex gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer hover:text-primary transition-colors">
                  {food.weight_g}g
                </span>
              </TooltipTrigger>
              <TooltipContent className="w-60 p-2">
                <p className="text-sm">The weight of this food item in grams. Accurate weight measurements help ensure precise nutrition tracking.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {food.nutrition && (
            <>
              <span>•</span>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="cursor-pointer hover:text-primary transition-colors">
                    {food.nutrition.calories.toFixed(1)} kcal
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Calories</h4>
                    <p className="text-sm">{getNutrientInfo("calories")}</p>
                  </div>
                </PopoverContent>
              </Popover>
              
              <span>•</span>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="cursor-pointer hover:text-primary transition-colors">
                    P: {food.nutrition.protein.toFixed(1)}g
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Protein</h4>
                    <p className="text-sm">{getNutrientInfo("protein")}</p>
                  </div>
                </PopoverContent>
              </Popover>
              
              <span>•</span>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="cursor-pointer hover:text-primary transition-colors">
                    C: {food.nutrition.carbs.toFixed(1)}g
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Carbohydrates</h4>
                    <p className="text-sm">{getNutrientInfo("carbs")}</p>
                  </div>
                </PopoverContent>
              </Popover>
              
              <span>•</span>
              <Popover>
                <PopoverTrigger asChild>
                  <span className="cursor-pointer hover:text-primary transition-colors">
                    F: {food.nutrition.fat.toFixed(1)}g
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Fat</h4>
                    <p className="text-sm">{getNutrientInfo("fat")}</p>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger className="text-xs text-muted-foreground px-2 py-1 rounded hover:bg-muted transition-colors cursor-pointer">
                  {food.category || "Uncategorized"}
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Click to change meal category</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent>
            {mealCategories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => onUpdateCategory(food.id, category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Delete this food entry</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
