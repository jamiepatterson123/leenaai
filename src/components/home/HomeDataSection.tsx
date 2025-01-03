import React from "react";
import { Card } from "@/components/ui/card";
import { MacroChart } from "@/components/reports/MacroChart";
import { WeightTrendChart } from "@/components/reports/WeightTrendChart";
import { CalorieChart } from "@/components/reports/CalorieChart";
import { MacroData, DailyMacroData } from "@/types/nutrition";

interface HomeDataSectionProps {
  weightData: {
    weight: number;
    date: string;
  }[];
  calorieData: {
    calories: number;
    date: string;
  }[];
  macroData: MacroData;
  isLoading: boolean;
}

export const HomeDataSection = ({
  weightData,
  calorieData,
  macroData,
  isLoading,
}: HomeDataSectionProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading data...
        </div>
      </div>
    );
  }

  // Transform macroData for MacroChart
  const dailyMacroData: DailyMacroData[] = macroData.protein.map((item, index) => ({
    date: item.date,
    protein: macroData.protein[index].value,
    carbs: macroData.carbs[index].value,
    fat: macroData.fat[index].value,
  }));

  return (
    <div className="grid gap-8">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Recent Progress</h2>
        <div className="grid gap-8">
          {weightData && weightData.length > 0 && (
            <WeightTrendChart data={weightData} />
          )}
          {calorieData && calorieData.length > 0 && (
            <CalorieChart data={calorieData} />
          )}
          {dailyMacroData && dailyMacroData.length > 0 && (
            <MacroChart data={dailyMacroData} />
          )}
        </div>
      </Card>
    </div>
  );
};