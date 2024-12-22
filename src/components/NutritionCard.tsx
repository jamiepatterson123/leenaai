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
  selectedDate: string;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ 
  foods, 
  onDelete,
  onUpdateCategory,
  selectedDate
}) => {
  const totalNutrition = TotalNutrition({ foods });
  const targets = useNutritionTargets();

  const getDateDisplay = () => {
    const date = new Date(selectedDate);
    if (isToday(date)) {
      return "Today";
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const chartData = [
    {
      name: "Energy",
      value: totalNutrition.calories,
      target: targets.calories,
      percentage: Math.round((totalNutrition.calories / targets.calories) * 100),
    },
    {
      name: "Protein",
      value: totalNutrition.protein,
      target: targets.protein,
      percentage: Math.round((totalNutrition.protein / targets.protein) * 100),
    },
    {
      name: "Net Carbs",
      value: totalNutrition.carbs,
      target: targets.carbs,
      percentage: Math.round((totalNutrition.carbs / targets.carbs) * 100),
    },
    {
      name: "Fat",
      value: totalNutrition.fat,
      target: targets.fat,
      percentage: Math.round((totalNutrition.fat / targets.fat) * 100),
    },
  ];

  return (
    <Card className="p-6 bg-background border-border/5 shadow-lg animate-fade-up">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{getDateDisplay()}</h2>
            <ChevronRight className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">
            {format(new Date(selectedDate), "EEEE - 'Default Macronutrient Targets'")}
          </span>
        </div>

        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {item.name} - {item.value.toFixed(1)} / {item.target.toFixed(1)}{" "}
                  {item.name === "Energy" ? "kcal" : "g"}
                </span>
                <span>{item.percentage}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
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