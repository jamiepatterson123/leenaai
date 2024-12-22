import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, subYears, eachDayOfInterval } from "date-fns";
import { WeightChart } from "@/components/reports/WeightChart";
import { CalorieChart } from "@/components/reports/CalorieChart";
import { MacroChart } from "@/components/reports/MacroChart";
import { MacroTargetsChart } from "@/components/reports/MacroTargetsChart";
import { WeightTrendChart } from "@/components/reports/WeightTrendChart";
import { MealDistributionChart } from "@/components/reports/MealDistributionChart";
import { CalorieTargetsChart } from "@/components/reports/CalorieTargetsChart";
import { TimeRange, TimeRangeSelector } from "@/components/reports/TimeRangeSelector";
import { useState } from "react";

interface WeightEntry {
  weight_kg: number;
  updated_at: string;
}

const getStartDate = (timeRange: TimeRange) => {
  const now = new Date();
  switch (timeRange) {
    case "1w":
      return subDays(now, 6);
    case "2w":
      return subDays(now, 13);
    case "1m":
      return subMonths(now, 1);
    case "2m":
      return subMonths(now, 2);
    case "6m":
      return subMonths(now, 6);
    case "1y":
      return subYears(now, 1);
  }
};

const Reports = () => {
  const [weightTimeRange, setWeightTimeRange] = useState<TimeRange>("1w");
  const [calorieTimeRange, setCalorieTimeRange] = useState<TimeRange>("1w");
  const [macroTimeRange, setMacroTimeRange] = useState<TimeRange>("1w");
  const [mealTimeRange, setMealTimeRange] = useState<TimeRange>("1w");

  const { data: weightData, isLoading: weightLoading } = useQuery({
    queryKey: ["weightHistory", weightTimeRange],
    queryFn: async () => {
      const startDate = getStartDate(weightTimeRange);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("weight_kg, updated_at")
        .gte("updated_at", startDate.toISOString())
        .order("updated_at", { ascending: true });

      if (error) throw error;

      return profile.map((entry: WeightEntry) => ({
        weight: entry.weight_kg,
        date: format(new Date(entry.updated_at), "MMM d"),
      }));
    },
  });

  const { data: calorieData, isLoading: caloriesLoading } = useQuery({
    queryKey: ["calorieHistory", calorieTimeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = getStartDate(calorieTimeRange);
      
      const { data, error } = await supabase
        .from("food_diary")
        .select("date, calories")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (error) throw error;

      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      const calorieMap = (data || []).reduce((acc: { [key: string]: number }, entry) => {
        acc[entry.date] = entry.calories;
        return acc;
      }, {});

      return dateRange.map(date => ({
        date: format(date, "MMM d"),
        calories: calorieMap[format(date, "yyyy-MM-dd")] || 0,
      }));
    },
  });

  const { data: macroData, isLoading: macrosLoading } = useQuery({
    queryKey: ["macroHistory", macroTimeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = getStartDate(macroTimeRange);
      
      const { data, error } = await supabase
        .from("food_diary")
        .select("date, protein, carbs, fat")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (error) throw error;

      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Initialize macro maps
      const macroMaps = {
        protein: {} as { [key: string]: number[] },
        carbs: {} as { [key: string]: number[] },
        fat: {} as { [key: string]: number[] },
      };

      // Group all macro values by date
      (data || []).forEach(entry => {
        const dateKey = entry.date;
        if (!macroMaps.protein[dateKey]) {
          macroMaps.protein[dateKey] = [];
          macroMaps.carbs[dateKey] = [];
          macroMaps.fat[dateKey] = [];
        }
        macroMaps.protein[dateKey].push(entry.protein);
        macroMaps.carbs[dateKey].push(entry.carbs);
        macroMaps.fat[dateKey].push(entry.fat);
      });

      return dateRange.map(date => {
        const dateKey = format(date, "yyyy-MM-dd");
        const getAverage = (arr: number[]) => 
          arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        return {
          date: format(date, "MMM d"),
          protein: getAverage(macroMaps.protein[dateKey] || []),
          carbs: getAverage(macroMaps.carbs[dateKey] || []),
          fat: getAverage(macroMaps.fat[dateKey] || []),
        };
      });
    },
  });

  const { data: mealData, isLoading: mealsLoading } = useQuery({
    queryKey: ["mealDistribution", mealTimeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = getStartDate(mealTimeRange);
      
      const { data, error } = await supabase
        .from("food_diary")
        .select("calories, category")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0]);

      if (error) throw error;
      return data || [];
    },
  });

  if (weightLoading || caloriesLoading || macrosLoading || mealsLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Reports</h1>
      <div className="grid gap-8">
        <div className="relative">
          <div className="absolute top-6 right-6 z-10">
            <TimeRangeSelector value={weightTimeRange} onChange={setWeightTimeRange} />
          </div>
          <WeightTrendChart data={weightData} />
        </div>
        <div className="relative">
          <div className="absolute top-6 right-6 z-10">
            <TimeRangeSelector value={calorieTimeRange} onChange={setCalorieTimeRange} />
          </div>
          <CalorieTargetsChart data={calorieData} />
        </div>
        <div className="relative">
          <div className="absolute top-6 right-6 z-10">
            <TimeRangeSelector value={calorieTimeRange} onChange={setCalorieTimeRange} />
          </div>
          <CalorieChart data={calorieData} />
        </div>
        <div className="relative">
          <div className="absolute top-6 right-6 z-10">
            <TimeRangeSelector value={macroTimeRange} onChange={setMacroTimeRange} />
          </div>
          <MacroChart data={macroData} />
        </div>
        <div className="relative">
          <div className="absolute top-6 right-6 z-10">
            <TimeRangeSelector value={macroTimeRange} onChange={setMacroTimeRange} />
          </div>
          <MacroTargetsChart data={macroData} />
        </div>
        <div className="relative">
          <div className="absolute top-6 right-6 z-10">
            <TimeRangeSelector value={mealTimeRange} onChange={setMealTimeRange} />
          </div>
          <MealDistributionChart data={mealData} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
