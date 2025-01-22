import React from "react";
import { Card } from "@/components/ui/card";
import { TotalNutrition } from "./nutrition/TotalNutrition";
import { FoodList } from "./nutrition/FoodList";
import { useNutritionTargets } from "./nutrition/useNutritionTargets";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { MacroProgressBar } from "./MacroProgressBar";
import { useNavigate } from "react-router-dom";

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
            <ChevronLeft 
              className="w-6 h-6 text-primary cursor-pointer hover:text-primary/80" 
              onClick={() => handleDateChange('prev')}
            />
            <h2 className="text-xl md:text-2xl font-bold">
              {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            <ChevronRight 
              className="w-6 h-6 text-primary cursor-pointer hover:text-primary/80" 
              onClick={() => handleDateChange('next')}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {format(selectedDate, "EEEE - 'Default Macronutrient Targets'")}
          </span>
        </div>

        <div className="space-y-4 md:space-y-6">
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