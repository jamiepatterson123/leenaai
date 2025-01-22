import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export const useFoodDiaryData = (selectedDate: Date) => {
  const queryClient = useQueryClient();
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  const { data: foodEntries, isLoading: isLoadingFood, error: foodError } = useQuery({
    queryKey: ["foodDiary", formattedDate],
    queryFn: async () => {
      console.log("Fetching food entries for date:", formattedDate);
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user?.id);
      
      if (!user) {
        console.error("No authenticated user found");
        toast.error("Please log in to view your food diary");
        return [];
      }

      const { data, error } = await supabase
        .from("food_diary")
        .select("*")
        .eq("date", formattedDate)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching food entries:", error);
        toast.error("Failed to load food diary");
        throw error;
      }

      return data || [];
    },
  });

  const { data: weightEntry, isLoading: isLoadingWeight } = useQuery({
    queryKey: ["weightHistory", formattedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("weight_history")
        .select("*")
        .eq("recorded_at", formattedDate)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching weight entry:", error);
        return null;
      }

      return data;
    },
  });

  return {
    foodEntries,
    weightEntry,
    isLoading: isLoadingFood || isLoadingWeight,
    error: foodError
  };
};