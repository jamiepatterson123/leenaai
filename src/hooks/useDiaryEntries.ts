import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FoodDiaryEntry } from "@/types/food";

export const useDiaryEntries = (formattedDate: string) => {
  // Fetch food diary entries
  const { data: foodData = [], isLoading: isFoodLoading } = useQuery({
    queryKey: ["foodDiary", formattedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: foodEntries, error: foodError } = await supabase
        .from("food_diary")
        .select("*")
        .eq("date", formattedDate)
        .eq("user_id", user.id);

      if (foodError) throw foodError;
      return foodEntries || [];
    },
  });

  // Fetch weight entries for the selected date
  const { data: weightData = [], isLoading: isWeightLoading } = useQuery({
    queryKey: ["weightHistory", formattedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data: weightEntries, error: weightError } = await supabase
        .from("weight_history")
        .select("*")
        .eq("user_id", user.id)
        .gte("recorded_at", `${formattedDate}T00:00:00`)
        .lt("recorded_at", `${formattedDate}T23:59:59`);

      console.log("Raw weight entries:", weightEntries);

      if (weightError) throw weightError;
      return weightEntries || [];
    },
  });

  return {
    foodData,
    weightData,
    isLoading: isFoodLoading || isWeightLoading
  };
};