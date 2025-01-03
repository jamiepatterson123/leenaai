import { useState } from "react";
import { TimeRange } from "@/components/reports/TimeRangeSelector";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsContent } from "@/components/reports/ReportsContent";
import { IndividualMacroChart } from "@/components/reports/IndividualMacroChart";
import { useReportsData } from "@/hooks/useReportsData";

const Reports = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1w");
  const { weightData, calorieData, macroData, mealData, isLoading } = useReportsData(timeRange);

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-8">
      <ReportsHeader 
        timeRange={timeRange} 
        onTimeRangeChange={setTimeRange} 
      />
      
      {!isLoading && macroData && (
        <div className="grid gap-8">
          <IndividualMacroChart
            data={macroData.protein}
            title="Daily Protein Intake"
            color="rgb(14, 165, 233)"
            unit="g"
          />
          <IndividualMacroChart
            data={macroData.carbs}
            title="Daily Carbohydrate Intake"
            color="rgb(34, 197, 94)"
            unit="g"
          />
          <IndividualMacroChart
            data={macroData.fat}
            title="Daily Fat Intake"
            color="rgb(249, 115, 22)"
            unit="g"
          />
        </div>
      )}

      <ReportsContent 
        weightData={weightData}
        calorieData={calorieData}
        macroData={macroData}
        mealData={mealData}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Reports;