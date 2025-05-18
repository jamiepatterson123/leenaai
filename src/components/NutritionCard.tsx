
import React from "react";
import { Card } from "@/components/ui/card";
import { TotalNutrition } from "./nutrition/TotalNutrition";
import { FoodList } from "./nutrition/FoodList";
import { useNutritionTargets } from "./nutrition/useNutritionTargets";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { MacroProgressBar } from "./MacroProgressBar";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionCardProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    nutrition: NutritionInfo;
    category?: string;
  }>;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  selectedDate: Date;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ 
  foods, 
  onDelete,
  onUpdateCategory,
  selectedDate
}) => {
  const totalNutrition = TotalNutrition({ foods });
  const { targets } = useNutritionTargets();
  const navigate = useNavigate();

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subDays(selectedDate, 1)
      : addDays(selectedDate, 1);
    
    navigate(`/food-diary?date=${format(newDate, 'yyyy-MM-dd')}`);
  };

  const macros = [
    {
      name: "Calories",
      current: totalNutrition.calories,
      target: targets.calories,
      color: "bg-primary"
    },
    {
      name: "Protein",
      current: totalNutrition.protein,
      target: targets.protein,
      color: "bg-red-500"
    },
    {
      name: "Carbs",
      current: totalNutrition.carbs,
      target: targets.carbs,
      color: "bg-yellow-500"
    },
    {
      name: "Fat",
      current: totalNutrition.fat,
      target: targets.fat,
      color: "bg-blue-500"
    },
  ];

  return (
    <Card className="p-4 md:p-6 bg-background border-border/5 shadow-lg animate-fade-up w-full">
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ChevronLeft 
                    className="w-6 h-6 text-[#D946EF] cursor-pointer hover:text-[#8B5CF6]" 
                    onClick={() => handleDateChange('prev')}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Previous day</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 className="text-xl md:text-2xl font-bold cursor-pointer">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </h2>
                </TooltipTrigger>
                <TooltipContent className="w-60 p-2">
                  <p className="text-sm">This is your food diary for the selected date. Navigate between days using the arrows.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ChevronRight 
                    className="w-6 h-6 text-[#D946EF] cursor-pointer hover:text-[#8B5CF6]" 
                    onClick={() => handleDateChange('next')}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Next day</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-muted-foreground cursor-pointer">
                  {format(selectedDate, "EEEE - 'Default Macronutrient Targets'")}
                </span>
              </TooltipTrigger>
              <TooltipContent className="w-80 p-2">
                <div className="space-y-2">
                  <p className="text-sm">
                    These are your default nutritional targets based on your profile settings.
                    You can adjust your targets in the Profile section to match your specific goals.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-4 md:space-y-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer">
                  <h3 className="text-md font-semibold">Daily Progress</h3>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-80 p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">About Your Daily Progress</h4>
                  <p className="text-sm">
                    These progress bars show how close you are to reaching your daily nutrition targets. 
                    Tap on each nutrient name or value for more detailed information about its importance 
                    and how it's calculated.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {macros.map((macro) => (
            <MacroProgressBar
              key={macro.name}
              label={macro.name}
              current={macro.current}
              target={macro.target}
              color={macro.color}
            />
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Food Diary</h3>
          <FoodList 
            foods={foods} 
            onDelete={onDelete} 
            onUpdateCategory={onUpdateCategory}
          />
        </div>
      </div>
    </Card>
  );
};
