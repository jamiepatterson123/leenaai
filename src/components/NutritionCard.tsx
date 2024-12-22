import React from "react";
import { Card } from "@/components/ui/card";
import { TotalNutrition } from "./nutrition/TotalNutrition";
import { FoodList } from "./nutrition/FoodList";
import { useNutritionTargets } from "./nutrition/useNutritionTargets";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { NutritionBarChart } from "./NutritionBarChart";

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
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ 
  foods, 
  onDelete,
  onUpdateCategory 
}) => {
  const totalNutrition = TotalNutrition({ foods });
  const targets = useNutritionTargets();

  const chartData = [
    {
      name: "Energy",
      value: totalNutrition.calories,
      target: targets.calories,
      color: "bg-primary",
    },
    {
      name: "Protein",
      value: totalNutrition.protein,
      target: targets.protein,
      color: "bg-green-500",
    },
    {
      name: "Net Carbs",
      value: totalNutrition.carbs,
      target: targets.carbs,
      color: "bg-blue-500",
    },
    {
      name: "Fat",
      value: totalNutrition.fat,
      target: targets.fat,
      color: "bg-orange-500",
    },
  ];

  return (
    <Card className="p-6 bg-background border-border/5 shadow-lg animate-fade-up">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Today</h2>
            <ChevronRight className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE - 'Daily Nutrition'")}
          </span>
        </div>

        <NutritionBarChart data={chartData} />

        <FoodList 
          foods={foods} 
          onDelete={onDelete} 
          onUpdateCategory={onUpdateCategory}
        />
      </div>
    </Card>
  );
};