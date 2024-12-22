import React from "react";
import { Card } from "@/components/ui/card";
import { NutritionBarChart } from "./NutritionBarChart";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionCardProps {
  foods: Array<{
    name: string;
    weight_g: number;
    nutrition: NutritionInfo;
  }>;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ foods }) => {
  const totalNutrition = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.nutrition.calories,
      protein: acc.protein + food.nutrition.protein,
      carbs: acc.carbs + food.nutrition.carbs,
      fat: acc.fat + food.nutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const chartData = [
    {
      name: "Protein",
      value: Math.round(totalNutrition.protein),
      fill: "hsl(var(--secondary))",
    },
    {
      name: "Carbs",
      value: Math.round(totalNutrition.carbs),
      fill: "hsl(var(--success))",
    },
    {
      name: "Fat",
      value: Math.round(totalNutrition.fat),
      fill: "hsl(var(--accent-foreground))",
    },
  ];

  return (
    <Card className="p-6 animate-fade-up">
      <h3 className="text-xl font-semibold mb-4">Nutritional Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Calories</p>
          <p className="text-2xl font-bold text-primary">
            {Math.round(totalNutrition.calories)}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Protein</p>
          <p className="text-2xl font-bold text-secondary">
            {Math.round(totalNutrition.protein)}g
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Carbs</p>
          <p className="text-2xl font-bold text-success">
            {Math.round(totalNutrition.carbs)}g
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Fat</p>
          <p className="text-2xl font-bold text-accent-foreground">
            {Math.round(totalNutrition.fat)}g
          </p>
        </div>
      </div>

      <NutritionBarChart data={chartData} />

      <div className="mt-6">
        <h4 className="font-medium mb-2">Foods Detected</h4>
        <ul className="space-y-2">
          {foods.map((food, index) => (
            <li
              key={index}
              className="flex justify-between items-center text-sm text-gray-600"
            >
              <span className="capitalize">{food.name}</span>
              <span>{food.weight_g}g</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};