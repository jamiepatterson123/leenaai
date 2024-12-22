import React from "react";

interface CaloriesSummaryProps {
  calculatedCalories: number;
}

export const CaloriesSummary: React.FC<CaloriesSummaryProps> = ({
  calculatedCalories,
}) => {
  return (
    <div className="text-sm font-medium">
      Calculated Daily Calories: {Math.round(calculatedCalories)} kcal
    </div>
  );
};