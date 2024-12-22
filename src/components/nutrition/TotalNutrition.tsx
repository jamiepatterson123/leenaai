import React from "react";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface TotalNutritionProps {
  foods: Array<{
    nutrition: NutritionInfo;
  }>;
}

export const TotalNutrition = ({ foods }: TotalNutritionProps) => {
  const totalNutrition = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.nutrition.calories,
      protein: acc.protein + food.nutrition.protein,
      carbs: acc.carbs + food.nutrition.carbs,
      fat: acc.fat + food.nutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return totalNutrition;
};