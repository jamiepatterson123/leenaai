import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const RealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const foodDiaryChannel = supabase
      .channel('diary_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'food_diary'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['foodDiary'] });
          queryClient.invalidateQueries({ queryKey: ['calorieHistory'] });
          queryClient.invalidateQueries({ queryKey: ['macroHistory'] });
          queryClient.invalidateQueries({ queryKey: ['mealDistribution'] });
        }
      )
      .subscribe();

    const weightChannel = supabase
      .channel('weight_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_history'
        },
        (payload) => {
          console.log('Weight update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(foodDiaryChannel);
      supabase.removeChannel(weightChannel);
    };
  }, [queryClient]);

  return null;
};