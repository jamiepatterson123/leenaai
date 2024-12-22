import React from "react";
import { Card } from "@/components/ui/card";
import { TotalNutrition } from "./nutrition/TotalNutrition";
import { FoodList } from "./nutrition/FoodList";
import { useNutritionTargets } from "./nutrition/useNutritionTargets";
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
  }>;
  onDelete: (id: string) => void;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ foods, onDelete }) => {
  const totalNutrition = TotalNutrition({ foods });
  const targets = useNutritionTargets();

  const chartData = [
    {
      name: "Energy",
      value: totalNutrition.calories,
      target: targets.calories,
      color: "#8B5CF6", // Vivid Purple
    },
    {
      name: "Protein",
      value: totalNutrition.protein,
      target: targets.protein,
      color: "#D946EF", // Magenta Pink
    },
    {
      name: "Net Carbs",
      value: totalNutrition.carbs,
      target: targets.carbs,
      color: "#F97316", // Bright Orange
    },
    {
      name: "Fat",
      value: totalNutrition.fat,
      target: targets.fat,
      color: "#0EA5E9", // Ocean Blue
    },
  ];

  return (
    <Card className="p-6 animate-fade-up">
      <h3 className="text-xl font-semibold mb-6">Daily Progress</h3>
      <NutritionBarChart data={chartData} />
      <FoodList foods={foods} onDelete={onDelete} />
    </Card>
  );
};