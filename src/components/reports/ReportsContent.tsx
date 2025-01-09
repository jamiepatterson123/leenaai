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
    <div className="grid gap-4 md:gap-6">
      <ChartSettings 
        visibleCharts={visibleCharts} 
        onToggleChart={handleToggleChart}
      />
      
      <div className="grid gap-4 md:gap-6">
        {/* Weight Trend */}
        {visibleCharts.weightTrend && (
          <WeightTrendChart 
            data={weightData}
            timeRange={timeRange}
          />
        )}
        
        {/* Calories per day */}
        {visibleCharts.calories && (
          <CalorieChart data={calorieData} />
        )}
        
        {/* Macronutrients daily charts */}
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
        
        {/* Water consumption */}
        {visibleCharts.waterConsumption && (
          <WaterConsumptionChart data={waterData} />
        )}
        
        {/* Calories per meal and state */}
        {visibleCharts.mealDistribution && (
          <MealDistributionChart data={mealData} />
        )}
        {visibleCharts.calorieState && (
          <CalorieStateChart data={mealData} />
        )}
        
        {/* Macronutrient averages */}
        {visibleCharts.macros && (
          <MacroChart data={macroData} />
        )}
        
        {/* Weekly averages vs targets */}
        {visibleCharts.calorieTargets && (
          <CalorieTargetsChart data={calorieData} />
        )}
        {visibleCharts.macroTargets && (
          <MacroTargetsChart data={macroData} />
        )}
      </div>
    </div>
  );
};