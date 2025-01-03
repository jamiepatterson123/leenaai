import { useState } from "react";
import { WeightTrendChart } from "./WeightTrendChart";
import { CalorieTargetsChart } from "./CalorieTargetsChart";
import { CalorieChart } from "./CalorieChart";
import { MacroChart } from "./MacroChart";
import { MacroTargetsChart } from "./MacroTargetsChart";
import { MealDistributionChart } from "./MealDistributionChart";
import { CalorieStateChart } from "./CalorieStateChart";
import { ChartSettings, VisibleCharts } from "./ChartSettings";

interface ReportsContentProps {
  weightData: any[];
  calorieData: any[];
  macroData: {
    protein: { date: string; value: number; average: number }[];
    carbs: { date: string; value: number; average: number }[];
    fat: { date: string; value: number; average: number }[];
  };
  mealData: any[];
  isLoading: boolean;
}

export const ReportsContent = ({ 
  weightData, 
  calorieData, 
  macroData, 
  mealData,
  isLoading 
}: ReportsContentProps) => {
  const [visibleCharts, setVisibleCharts] = useState<VisibleCharts>({
    weightTrend: true,
    calorieTargets: true,
    calories: true,
    mealDistribution: true,
    calorieState: true,
    macros: true,
    macroTargets: true,
  });

  const handleToggleChart = (chart: keyof VisibleCharts) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chart]: !prev[chart]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <ChartSettings 
        visibleCharts={visibleCharts} 
        onToggleChart={handleToggleChart}
      />
      
      {visibleCharts.weightTrend && (
        <WeightTrendChart data={weightData} />
      )}
      {visibleCharts.calorieTargets && (
        <CalorieTargetsChart data={calorieData} />
      )}
      {visibleCharts.calories && (
        <CalorieChart data={calorieData} />
      )}
      {visibleCharts.mealDistribution && visibleCharts.calorieState && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MealDistributionChart data={mealData} />
          <CalorieStateChart data={mealData} />
        </div>
      )}
      {!visibleCharts.mealDistribution && visibleCharts.calorieState && (
        <CalorieStateChart data={mealData} />
      )}
      {visibleCharts.mealDistribution && !visibleCharts.calorieState && (
        <MealDistributionChart data={mealData} />
      )}
      {visibleCharts.macros && (
        <MacroChart data={macroData} />
      )}
      {visibleCharts.macroTargets && macroData && (
        <MacroTargetsChart data={macroData} />
      )}
    </div>
  );
};