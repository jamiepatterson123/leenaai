import React from "react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
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

  // Define targets
  const targets = {
    calories: 1800,
    protein: 200,
    carbs: 100,
    fat: 70,
  };

  return (
    <Card className="p-6 animate-fade-up">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-2xl font-semibold">Targets</h3>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Your daily nutrition targets based on your goals</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Energy</span>
            <div className="text-right">
              <span className="font-mono">
                {Math.round(totalNutrition.calories)} ({Math.round(totalNutrition.calories * 0.89)} net) /{" "}
                {targets.calories} kcal
              </span>
              <span className="ml-4 text-muted-foreground">
                {Math.round((totalNutrition.calories / targets.calories) * 100)}%
              </span>
            </div>
          </div>
          <ProgressBar
            current={totalNutrition.calories}
            target={targets.calories}
            color="#8E9196"  // Neutral Gray from previous palette
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Protein</span>
            <div className="text-right">
              <span className="font-mono">
                {Math.round(totalNutrition.protein)} / {targets.protein} g
              </span>
              <span className="ml-4 text-muted-foreground">
                {Math.round((totalNutrition.protein / targets.protein) * 100)}%
              </span>
            </div>
          </div>
          <ProgressBar
            current={totalNutrition.protein}
            target={targets.protein}
            color="#9b87f5"  // Primary Purple from previous palette
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Net Carbs</span>
            <div className="text-right">
              <span className="font-mono">
                {Math.round(totalNutrition.carbs)} / {targets.carbs} g
              </span>
              <span className="ml-4 text-muted-foreground">
                {Math.round((totalNutrition.carbs / targets.carbs) * 100)}%
              </span>
            </div>
          </div>
          <ProgressBar
            current={totalNutrition.carbs}
            target={targets.carbs}
            color="#0EA5E9"  // Ocean Blue from previous palette
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Fat</span>
            <div className="text-right">
              <span className="font-mono">
                {Math.round(totalNutrition.fat)} / {targets.fat} g
              </span>
              <span className="ml-4 text-muted-foreground">
                {Math.round((totalNutrition.fat / targets.fat) * 100)}%
              </span>
            </div>
          </div>
          <ProgressBar
            current={totalNutrition.fat}
            target={targets.fat}
            color="#ea384c"  // Red from previous palette
          />
        </div>
      </div>

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