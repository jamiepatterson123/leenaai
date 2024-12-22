import { WeightTrendChart } from "./WeightTrendChart";
import { CalorieTargetsChart } from "./CalorieTargetsChart";
import { CalorieChart } from "./CalorieChart";
import { MacroChart } from "./MacroChart";
import { MacroTargetsChart } from "./MacroTargetsChart";
import { MealDistributionChart } from "./MealDistributionChart";
import { TimeRange } from "./TimeRangeSelector";

interface ReportsContentProps {
  weightData: any[];
  calorieData: any[];
  macroData: any[];
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
      <WeightTrendChart data={weightData} />
      <CalorieTargetsChart data={calorieData} />
      <CalorieChart data={calorieData} />
      <MacroChart data={macroData} />
      <MacroTargetsChart data={macroData} />
      <MealDistributionChart data={mealData} />
    </div>
  );
};