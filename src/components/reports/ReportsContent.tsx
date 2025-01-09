import { useState } from "react";
import { WeightTrendChart } from "./WeightTrendChart";
import { CalorieTargetsChart } from "./CalorieTargetsChart";
import { CalorieChart } from "./CalorieChart";
import { MacroChart } from "./MacroChart";
import { MacroTargetsChart } from "./MacroTargetsChart";
import { MealDistributionChart } from "./MealDistributionChart";
import { CalorieStateChart } from "./CalorieStateChart";
import { MacroDailyChart } from "./MacroDailyChart";
import { ChartSettings, VisibleCharts } from "./ChartSettings";
import { TimeRange } from "./TimeRangeSelector";
import { 
  processWeightData, 
  processCalorieData, 
  processMacroData, 
  processWaterData,
  processMealData 
} from "./DataProcessor";
import { startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";

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
    waterConsumption: false, // Set to false by default now
  });

  const handleToggleChart = (chart: keyof VisibleCharts) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chart]: !prev[chart]
    }));
  };

  // Calculate date range based on timeRange
  const endDate = endOfDay(new Date());
  let startDate;
  
  switch (timeRange) {
    case "1w":
      startDate = startOfDay(subWeeks(endDate, 1));
      break;
    case "2w":
      startDate = startOfDay(subWeeks(endDate, 2));
      break;
    case "1m":
      startDate = startOfDay(subMonths(endDate, 1));
      break;
    case "2m":
      startDate = startOfDay(subMonths(endDate, 2));
      break;
    case "6m":
      startDate = startOfDay(subMonths(endDate, 6));
      break;
    case "1y":
      startDate = startOfDay(subMonths(endDate, 12));
      break;
    default:
      startDate = startOfDay(subDays(endDate, 7));
  }

  // Process data with date range
  const processedWeightData = processWeightData(weightData, startDate, endDate);
  const processedCalorieData = processCalorieData(calorieData, startDate, endDate);
  const processedMacroData = processMacroData(macroData, startDate, endDate);
  const processedWaterData = processWaterData(waterData, startDate, endDate);
  const processedMealData = processMealData(mealData, startDate, endDate);

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
            data={processedWeightData}
            timeRange={timeRange}
          />
        )}
        
        {/* Calories per day */}
        {visibleCharts.calories && (
          <CalorieChart data={processedCalorieData} />
        )}
        
        {/* Macronutrients daily charts */}
        {visibleCharts.proteinDaily && (
          <MacroDailyChart 
            data={processedMacroData}
            type="protein"
          />
        )}
        {visibleCharts.carbsDaily && (
          <MacroDailyChart 
            data={processedMacroData}
            type="carbs"
          />
        )}
        {visibleCharts.fatDaily && (
          <MacroDailyChart 
            data={processedMacroData}
            type="fat"
          />
        )}
        
        {/* Calories per meal and state */}
        {visibleCharts.mealDistribution && (
          <MealDistributionChart data={processedMealData} />
        )}
        {visibleCharts.calorieState && (
          <CalorieStateChart data={processedMealData} />
        )}
        
        {/* Macronutrient averages */}
        {visibleCharts.macros && (
          <MacroChart data={processedMacroData} />
        )}
        
        {/* Weekly averages vs targets */}
        {visibleCharts.calorieTargets && (
          <CalorieTargetsChart data={processedCalorieData} />
        )}
        {visibleCharts.macroTargets && (
          <MacroTargetsChart data={processedMacroData} />
        )}
      </div>
    </div>
  );
};