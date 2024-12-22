import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { WeightChart } from "@/components/reports/WeightChart";
import { CalorieChart } from "@/components/reports/CalorieChart";
import { MacroChart } from "@/components/reports/MacroChart";
import { MacroTargetsChart } from "@/components/reports/MacroTargetsChart";
import { WeightTrendChart } from "@/components/reports/WeightTrendChart";
import { MealDistributionChart } from "@/components/reports/MealDistributionChart";

const Reports = () => {
  const { data: weightData, isLoading: weightLoading } = useQuery({
    queryKey: ["weightHistory"],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("weight_kg, updated_at")
        .order("updated_at", { ascending: true });

      if (error) throw error;

      return profile.map((entry: WeightData) => ({
        weight: entry.weight_kg,
        date: format(new Date(entry.updated_at), "MMM d"),
      }));
    },
  });

  const { data: calorieData, isLoading: caloriesLoading } = useQuery({
    queryKey: ["calorieHistory"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, 6);
      
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
    queryKey: ["macroHistory"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, 6);
      
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

      // Calculate averages for each date
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
    queryKey: ["mealDistribution"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(endDate, 6);
      
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
        <WeightTrendChart data={weightData} />
        <CalorieChart data={calorieData} />
        <MacroChart data={macroData} />
        <MacroTargetsChart data={macroData} />
        <MealDistributionChart data={mealData} />
      </div>
    </div>
  );
};

export default Reports;
