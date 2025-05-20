import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeRange } from "./TimeRangeSelector";
import { startOfDay, endOfDay, subDays, subWeeks, subMonths, parseISO, format } from "date-fns";

export const useReportsData = (timeRange: TimeRange) => {
  const getDateRange = () => {
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
        startDate = startOfDay(subWeeks(endDate, 1));
    }
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

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

  const { data: weightData, isLoading: isLoadingWeight } = useQuery({
    queryKey: ["weightHistory", timeRange],
    queryFn: async () => {
      // Fetch all weight entries within the date range
      const { data, error } = await supabase
        .from("weight_history")
        .select("*")
        .gte("recorded_at", startDate.toISOString())
        .lte("recorded_at", endDate.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      
      // Process the data to only keep the latest entry per day
      const latestEntriesByDay = new Map();
      
      data?.forEach(entry => {
        const dateKey = entry.recorded_at.split('T')[0];
        
        // If we don't have an entry for this day yet, or if this entry is more recent, update the map
        if (!latestEntriesByDay.has(dateKey) || 
            new Date(entry.recorded_at) > new Date(latestEntriesByDay.get(dateKey).recorded_at)) {
          latestEntriesByDay.set(dateKey, entry);
        }
      });
      
      // Convert the map back to an array
      return Array.from(latestEntriesByDay.values()).map(entry => ({
        date: entry.recorded_at,
        weight: entry.weight_kg,
        id: entry.id  // Keep the ID for editing/deleting
      }));
    },
  });

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

  return {
    foodData,
    weightData,
    waterData,
    isLoading: isLoadingFood || isLoadingWeight || isLoadingWater,
  };
};
