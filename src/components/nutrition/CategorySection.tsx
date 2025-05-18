
import React from "react";
import { FoodItem } from "./FoodItem";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
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

interface CategorySectionProps {
  category: string;
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

  const totalCalories = foods?.reduce(
    (total, food) => total + (food.nutrition?.calories || 0),
    0
  ) || 0;

  const getCategoryInfo = () => {
    switch (category) {
      case "Breakfast":
        return "Breakfast provides your first energy of the day, kickstarting your metabolism after fasting overnight. Research shows eating breakfast can improve cognitive function and help maintain stable blood sugar levels throughout the morning.";
      case "Lunch":
        return "Lunch replenishes energy levels midday and helps maintain focus and productivity. A balanced lunch with protein, complex carbs, and healthy fats can prevent afternoon energy crashes.";
      case "Dinner":
        return "Dinner completes your daily nutrition needs. Timing matters - eating 2-3 hours before sleep allows for proper digestion and can improve sleep quality.";
      case "Snacks":
        return "Strategic snacking helps maintain blood sugar levels between meals, preventing extreme hunger that can lead to overeating. Opt for nutrient-dense options with protein and fiber for sustained energy.";
      default:
        return `This category helps you organize your meals and track nutrition by meal type. Grouping foods this way makes it easier to analyze your eating patterns.`;
    }
  };

  return (
    <Collapsible defaultOpen={true} className="w-full">
      <CollapsibleTrigger className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg backdrop-blur-sm border border-border/10 w-full group">
        <div className="flex justify-between items-center w-full">
          <Popover>
            <PopoverTrigger asChild>
              <span className="font-medium cursor-pointer hover:text-primary transition-colors">
                {category}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">{category} Nutrition</h4>
                <p className="text-sm text-muted-foreground">{getCategoryInfo()}</p>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm cursor-pointer hover:text-primary transition-colors">
                    {totalCalories} kcal
                  </span>
                </TooltipTrigger>
                <TooltipContent className="w-60 p-2">
                  <p className="text-sm">Total calories for all foods in this {category.toLowerCase()} category.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="w-full">
        {foods.length > 0 && (
          <div className="space-y-2 mt-2 w-full">
            {foods?.map((food) => (
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
