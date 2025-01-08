import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsContent } from "@/components/reports/ReportsContent";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { TimeRange } from "@/components/reports/TimeRangeSelector";

export const Reports = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  // Calculate the date range based on selected time range
  const getDateRange = () => {
    const endDate = endOfDay(new Date());
    let startDate;
    
    switch (timeRange) {
      case "7d":
        startDate = startOfDay(subDays(endDate, 7));
        break;
      case "14d":
        startDate = startOfDay(subDays(endDate, 14));
        break;
      case "30d":
        startDate = startOfDay(subDays(endDate, 30));
        break;
      default:
        startDate = startOfDay(subDays(endDate, 7));
    }
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch food diary data for the selected time range
  const { data: foodData, isLoading: isLoadingFood } = useQuery({
    queryKey: ["foodDiary", timeRange],
    queryFn: async () => {
      console.log("Fetching food diary data for date range:", { startDate, endDate });
      const { data, error } = await supabase
        .from("food_diary")
        .select("*")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Process food data into daily totals for charts
  const processedData = foodData ? foodData.reduce((acc: any, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }
    acc[date].calories += entry.calories;
    acc[date].protein += entry.protein;
    acc[date].carbs += entry.carbs;
    acc[date].fat += entry.fat;
    return acc;
  }, {}) : {};

  // Convert the processed data into arrays for different chart types
  const calorieData = Object.values(processedData).map((day: any) => ({
    date: day.date,
    calories: Math.round(day.calories)
  }));

  const macroData = Object.values(processedData).map((day: any) => ({
    date: day.date,
    protein: Math.round(day.protein),
    carbs: Math.round(day.carbs),
    fat: Math.round(day.fat)
  }));

  // Process meal distribution data
  const mealData = foodData ? foodData.map(entry => ({
    calories: entry.calories,
    category: entry.category || 'uncategorized',
    state: entry.state || 'solid'
  })) : [];

  // Fetch weight data
  const { data: weightData, isLoading: isLoadingWeight } = useQuery({
    queryKey: ["weightHistory", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weight_history")
        .select("*")
        .gte("recorded_at", startDate.toISOString())
        .lte("recorded_at", endDate.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      return data?.map(entry => ({
        date: entry.recorded_at.split('T')[0],
        weight: entry.weight_kg
      })) || [];
    },
  });

  // Fetch water consumption data
  const { data: waterData, isLoading: isLoadingWater } = useQuery({
    queryKey: ["waterConsumption", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("water_consumption")
        .select("*")
        .gte("timestamp", startDate.toISOString())
        .lte("timestamp", endDate.toISOString())
        .order("timestamp", { ascending: true });

      if (error) throw error;
      return data?.map(entry => ({
        timestamp: entry.timestamp.split('T')[0],
        amount_ml: entry.amount_ml
      })) || [];
    },
  });

  const isLoading = isLoadingFood || isLoadingWeight || isLoadingWater;

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