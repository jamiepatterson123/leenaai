import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { MacroData } from "@/types/nutrition";

export const useHomeData = () => {
  const { data: weightData, isLoading: weightLoading } = useQuery({
    queryKey: ["weightHistory", "1w"],
    queryFn: async () => {
      const startDate = subDays(new Date(), 6);
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
    queryKey: ["calorieHistory", "1w"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(new Date(), 6);
      
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
    queryKey: ["macroHistory", "1w"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(new Date(), 6);
      
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

      const result: MacroData = {
        protein: [],
        carbs: [],
        fat: [],
      };

      dateRange.forEach(date => {
        const dateKey = format(date, "yyyy-MM-dd");
        const formattedDate = format(date, "MMM d");
        const getAverage = (arr: number[]) => 
          arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        result.protein.push({
          date: formattedDate,
          value: getAverage(macroMaps.protein[dateKey] || []),
          average: getAverage(macroMaps.protein[dateKey] || []), // Added average property
        });
        result.carbs.push({
          date: formattedDate,
          value: getAverage(macroMaps.carbs[dateKey] || []),
          average: getAverage(macroMaps.carbs[dateKey] || []), // Added average property
        });
        result.fat.push({
          date: formattedDate,
          value: getAverage(macroMaps.fat[dateKey] || []),
          average: getAverage(macroMaps.fat[dateKey] || []), // Added average property
        });
      });

      return result;
    },
  });

  const { data: mealData, isLoading: mealsLoading } = useQuery({
    queryKey: ["mealDistribution", "1w"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(new Date(), 6);
      
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
    weightData,
    calorieData,
    macroData: macroData || { protein: [], carbs: [], fat: [] },
    mealData,
    isLoading: weightLoading || caloriesLoading || macrosLoading || mealsLoading
  };
};