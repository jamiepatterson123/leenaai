import { useState } from "react";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsContent } from "@/components/reports/ReportsContent";
import { TimeRange } from "@/components/reports/TimeRangeSelector";
import { useReportsData } from "@/components/reports/useReportsData";
import { processCalorieData, processMacroData, processMealData } from "@/components/reports/DataProcessor";
import { startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";

export const Reports = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1w");
  const { foodData, weightData, waterData, isLoading } = useReportsData(timeRange);

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

  // Process data for charts with date range
  const calorieData = foodData ? processCalorieData(foodData, startDate, endDate) : [];
  const macroData = foodData ? processMacroData(foodData, startDate, endDate) : [];
  const mealData = foodData ? processMealData(foodData, startDate, endDate) : [];

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-4 pb-40">
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