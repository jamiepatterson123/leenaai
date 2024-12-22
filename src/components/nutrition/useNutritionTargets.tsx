import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateTargets } from "@/utils/profileCalculations";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const useNutritionTargets = () => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      return data as Profile | null;
    },
    staleTime: 0, // This ensures we always get fresh data
    refetchOnMount: true,
  });

  let targets = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
  };

  if (profile) {
    if (profile.target_calories) {
      targets = {
        calories: profile.target_calories,
        protein: profile.target_protein || 150,
        carbs: profile.target_carbs || 200,
        fat: profile.target_fat || 70,
      };
    } else if (profile.height_cm && profile.weight_kg && profile.age && profile.activity_level && profile.gender) {
      targets = calculateTargets({
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        age: profile.age,
        activity_level: profile.activity_level,
        gender: profile.gender,
        fitness_goals: profile.fitness_goals || 'maintain',
        dietary_restrictions: profile.dietary_restrictions || [],
      });
    }
  }

  return targets;
};