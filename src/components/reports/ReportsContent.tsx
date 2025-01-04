import { useState } from "react";
import { WeightTrendChart } from "./WeightTrendChart";
import { CalorieTargetsChart } from "./CalorieTargetsChart";
import { CalorieChart } from "./CalorieChart";
import { MacroChart } from "./MacroChart";
import { MacroTargetsChart } from "./MacroTargetsChart";
import { MealDistributionChart } from "./MealDistributionChart";
import { CalorieStateChart } from "./CalorieStateChart";
import { MacroDailyChart } from "./MacroDailyChart";
import { WaterConsumptionChart } from "./WaterConsumptionChart";
import { ChartSettings, VisibleCharts } from "./ChartSettings";
import { TimeRange } from "./TimeRangeSelector";

interface ReportsContentProps {
  weightData: any[];
  calorieData: any[];
  macroData: any[];
  mealData: any[];
  waterData: any[];
  isLoading: boolean;
  timeRange: TimeRange;
}

export const ReportsContent = ({ 
  weightData, 
  calorieData, 
  macroData, 
  mealData,
  waterData,
  isLoading,
  timeRange
}: ReportsContentProps) => {
  const [visibleCharts, setVisibleCharts] = useState<VisibleCharts>({
    weightTrend: true,
    calorieTargets: true,
    calories: true,
    mealDistribution: true,
    calorieState: true,
    macros: true,
    macroTargets: true,
    proteinDaily: true,
    carbsDaily: true,
    fatDaily: true,
    waterConsumption: true,
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
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <ChartSettings 
        visibleCharts={visibleCharts} 
        onToggleChart={handleToggleChart}
      />
      
      {visibleCharts.weightTrend && (
        <WeightTrendChart 
          data={weightData}
          timeRange={timeRange}
        />
      )}
      {visibleCharts.calorieTargets && (
        <CalorieTargetsChart data={calorieData} />
      )}
      {visibleCharts.calories && (
        <CalorieChart data={calorieData} />
      )}
      {visibleCharts.mealDistribution && visibleCharts.calorieState && (
        <div className="grid grid-cols-1 gap-4">
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
      {visibleCharts.macroTargets && (
        <MacroTargetsChart data={macroData} />
      )}
      {visibleCharts.proteinDaily && (
        <MacroDailyChart 
          data={macroData}
          type="protein"
        />
      )}
      {visibleCharts.carbsDaily && (
        <MacroDailyChart 
          data={macroData}
          type="carbs"
        />
      )}
      {visibleCharts.fatDaily && (
        <MacroDailyChart 
          data={macroData}
          type="fat"
        />
      )}
      {visibleCharts.waterConsumption && (
        <WaterConsumptionChart data={waterData} />
      )}
    </div>
  );
};