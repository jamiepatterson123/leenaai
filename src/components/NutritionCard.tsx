import React from "react";
import { Card } from "@/components/ui/card";
import { TotalNutrition } from "./nutrition/TotalNutrition";
import { FoodList } from "./nutrition/FoodList";
import { useNutritionTargets } from "./nutrition/useNutritionTargets";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, formatDistanceToNow, isToday } from "date-fns";

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

  const macros = [
    {
      name: "Energy",
      current: totalNutrition.calories,
      target: targets.calories,
      unit: "kcal"
    },
    {
      name: "Protein",
      current: totalNutrition.protein,
      target: targets.protein,
      unit: "g"
    },
    {
      name: "Net Carbs",
      current: totalNutrition.carbs,
      target: targets.carbs,
      unit: "g"
    },
    {
      name: "Fat",
      current: totalNutrition.fat,
      target: targets.fat,
      unit: "g"
    },
  ];

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className="p-6 bg-background border-border/5 shadow-lg animate-fade-up">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-6 h-6 text-primary cursor-pointer hover:text-primary/80" />
            <h2 className="text-2xl font-bold">{getDateDisplay(selectedDate)}</h2>
            <ChevronRight className="w-6 h-6 text-primary cursor-pointer hover:text-primary/80" />
          </div>
          <span className="text-sm text-muted-foreground">
            {format(selectedDate, "EEEE - 'Default Macronutrient Targets'")}
          </span>
        </div>

        <div className="space-y-6">
          {macros.map((macro) => (
            <div key={macro.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-base">
                  {macro.name} - {macro.current.toFixed(1)} / {macro.target.toFixed(1)} {macro.unit}
                </span>
                <span className="text-base">
                  {Math.round((macro.current / macro.target) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ 
                    width: `${Math.min((macro.current / macro.target) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <FoodList 
          foods={foods} 
          onDelete={onDelete} 
          onUpdateCategory={onUpdateCategory}
        />
      </div>
    </Card>
  );
};