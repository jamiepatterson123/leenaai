import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type VisibleCharts = {
  weightTrend: boolean;
  calorieTargets: boolean;
  calories: boolean;
  mealDistribution: boolean;
  calorieState: boolean;
  macros: boolean;
  macroTargets: boolean;
  proteinDaily: boolean;
  carbsDaily: boolean;
  fatDaily: boolean;
  waterConsumption: boolean;
};

interface ChartSettingsProps {
  visibleCharts: VisibleCharts;
  onToggleChart: (chart: keyof VisibleCharts) => void;
}

export const ChartSettings = ({
  visibleCharts,
  onToggleChart,
}: ChartSettingsProps) => {
  const charts = [
    { id: "weightTrend", label: "Weight Trend" },
    { id: "calorieTargets", label: "Calorie Targets" },
    { id: "calories", label: "Calories Consumed" },
    { id: "mealDistribution", label: "Meal Distribution" },
    { id: "calorieState", label: "Calorie State" },
    { id: "macros", label: "Macronutrients" },
    { id: "macroTargets", label: "Macro Targets" },
    { id: "proteinDaily", label: "Daily Protein" },
    { id: "carbsDaily", label: "Daily Carbs" },
    { id: "fatDaily", label: "Daily Fat" },
    { id: "waterConsumption", label: "Water Consumption" },
  ] as const;

  return (
    <div className="bg-card border rounded-lg p-4 mb-8">
      <h3 className="font-semibold mb-4">Customize Reports</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {charts.map(({ id, label }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={visibleCharts[id as keyof VisibleCharts]}
              onCheckedChange={() => onToggleChart(id as keyof VisibleCharts)}
            />
            <Label htmlFor={id} className="text-sm">
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};