import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MacroCircle } from "@/components/nutrition/MacroCircle";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";

export const MacroCircles = () => {
  const { targets } = useNutritionTargets();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todaysMacros } = useQuery({
    queryKey: ["todaysMacros", today],
    queryFn: async () => {
      const { data: entries } = await supabase
        .from("food_diary")
        .select("calories, protein, carbs, fat")
        .eq("date", today);

      if (!entries?.length) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

      return entries.reduce((acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  });

  const macros = [
    {
      label: "Calories",
      current: todaysMacros?.calories || 0,
      target: targets.calories,
      color: "stroke-primary",
      unit: "kcal",
      isCalories: true
    },
    {
      label: "Protein",
      current: todaysMacros?.protein || 0,
      target: targets.protein,
      color: "stroke-red-500",
      unit: "g"
    },
    {
      label: "Carbs",
      current: todaysMacros?.carbs || 0,
      target: targets.carbs,
      color: "stroke-yellow-500",
      unit: "g"
    },
    {
      label: "Fat",
      current: todaysMacros?.fat || 0,
      target: targets.fat,
      color: "stroke-blue-500",
      unit: "g"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {macros.map((macro) => (
        <MacroCircle
          key={macro.label}
          label={macro.label}
          current={macro.current}
          target={macro.target}
          unit={macro.unit}
          color={macro.color}
          isCalories={macro.isCalories}
        />
      ))}
    </div>
  );
};