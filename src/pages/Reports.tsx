import { useState } from "react";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsContent } from "@/components/reports/ReportsContent";
import { TimeRange } from "@/components/reports/TimeRangeSelector";
import { useReportsData } from "@/components/reports/useReportsData";
import { processCalorieData, processMacroData, processMealData } from "@/components/reports/DataProcessor";

export const Reports = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1w");
  const { foodData, weightData, waterData, isLoading } = useReportsData(timeRange);

  // Process data for charts
  const calorieData = foodData ? processCalorieData(foodData) : [];
  const macroData = foodData ? processMacroData(foodData) : [];
  const mealData = foodData ? processMealData(foodData) : [];

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-4">
      <ReportsHeader 
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
      <ReportsContent
        weightData={weightData || []}
        calorieData={calorieData}
        macroData={macroData}
        mealData={mealData}
        waterData={waterData || []}
        isLoading={isLoading}
        timeRange={timeRange}
      />
    </div>
  );
};