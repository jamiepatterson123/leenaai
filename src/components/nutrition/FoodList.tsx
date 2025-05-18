
import React from "react";
import { CategorySection } from "./CategorySection";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FoodListProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    category?: string;
    nutrition: {
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
  onUpdateCategory,
}) => {
  const categories = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  
  const foodsByCategory = categories.map((category) => {
    return {
      category,
      foods: foods.filter((food) => food.category === category),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Daily Food Log</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-4">
              <div className="space-y-2">
                <h4 className="font-semibold">About the Food Diary</h4>
                <p className="text-sm">
                  Your food diary organizes all your meals by category for easy tracking. 
                  Each entry shows key nutrition metrics to help you reach your goals.
                  Tap on any item to learn more about what it represents.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {foods.length === 0 ? (
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-muted-foreground cursor-pointer">
                  No foods logged for this day. Take a photo of your meal to get started!
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Getting Started</h4>
                  <p className="text-sm">
                    Click on the camera button or use the image analysis section to take or upload a photo of your food.
                    Leena.ai will automatically analyze your meal and log its nutritional content.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="space-y-4">
          {foodsByCategory.map(({ category, foods }) => (
            <CategorySection
              key={category}
              category={category}
              foods={foods}
              onDelete={onDelete}
              onUpdateCategory={onUpdateCategory}
              mealCategories={categories}
            />
          ))}
        </div>
      )}
    </div>
  );
};
