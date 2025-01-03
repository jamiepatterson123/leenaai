import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, subYears, eachDayOfInterval } from "date-fns";
import { TimeRange } from "@/components/reports/TimeRangeSelector";
import { MacroData } from "@/types/nutrition";

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

export const useReportsData = (timeRange: TimeRange) => {
  const { data: weightData, isLoading: weightLoading } = useQuery({
    queryKey: ["weightHistory", timeRange],
    queryFn: async () => {
      const startDate = getStartDate(timeRange);
      const { data: weightHistory, error } = await supabase
        .from("weight_history")
        .select("weight_kg, recorded_at")
        .gte("recorded_at", startDate.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;

      return weightHistory.map((entry) => ({
        weight: entry.weight_kg,
        date: format(new Date(entry.recorded_at), "MMM d"),
      }));
    },
  });

  const { data: calorieData, isLoading: caloriesLoading } = useQuery({
    queryKey: ["calorieHistory", timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = getStartDate(timeRange);
      
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
    queryKey: ["macroHistory", timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = getStartDate(timeRange);
      
      const { data, error } = await supabase
        .from("food_diary")
        .select("date, protein, carbs, fat")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (error) throw error;

      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      const macroMaps = {
        protein: {} as { [key: string]: number[] },
        carbs: {} as { [key: string]: number[] },
        fat: {} as { [key: string]: number[] },
      };

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

      const processedData = dateRange.map(date => {
        const dateKey = format(date, "yyyy-MM-dd");
        const formattedDate = format(date, "MMM d");
        const getAverage = (arr: number[]) => 
          arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        return {
          date: formattedDate,
          protein: getAverage(macroMaps.protein[dateKey] || []),
          carbs: getAverage(macroMaps.carbs[dateKey] || []),
          fat: getAverage(macroMaps.fat[dateKey] || []),
        };
      });

      // Calculate rolling averages
      const calculateRollingAverage = (data: number[]) => {
        return data.map((_, index, array) => {
          const start = Math.max(0, index - 2);
          const values = array.slice(start, index + 1);
          return values.reduce((a, b) => a + b, 0) / values.length;
        });
      };

      const proteinValues = processedData.map(d => d.protein);
      const carbValues = processedData.map(d => d.carbs);
      const fatValues = processedData.map(d => d.fat);

      const proteinAverages = calculateRollingAverage(proteinValues);
      const carbAverages = calculateRollingAverage(carbValues);
      const fatAverages = calculateRollingAverage(fatValues);

      const result: MacroData = {
        protein: processedData.map((d, i) => ({
          date: d.date,
          value: d.protein,
          average: proteinAverages[i]
        })),
        carbs: processedData.map((d, i) => ({
          date: d.date,
          value: d.carbs,
          average: carbAverages[i]
        })),
        fat: processedData.map((d, i) => ({
          date: d.date,
          value: d.fat,
          average: fatAverages[i]
        }))
      };

      return result;
    },
  });

  const { data: mealData, isLoading: mealsLoading } = useQuery({
    queryKey: ["mealDistribution", timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = getStartDate(timeRange);
      
      const { data, error } = await supabase
        .from("food_diary")
        .select("calories, category")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0]);

      if (error) throw error;
      return data || [];
    },
  });

  return {
    weightData: weightData || [],
    calorieData: calorieData || [],
    macroData: macroData || { protein: [], carbs: [], fat: [] },
    mealData: mealData || [],
    isLoading: weightLoading || caloriesLoading || macrosLoading || mealsLoading
  };
};