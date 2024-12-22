import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { MacroProgressBar } from "./MacroProgressBar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateTargets } from "@/utils/profileCalculations";
import type { Database } from "@/integrations/supabase/types";
import { NutritionBarChart } from "./NutritionBarChart";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionCardProps {
  foods: Array<{
    id: string;
    name: string;
    weight_g: number;
    nutrition: NutritionInfo;
  }>;
  onDelete: (id: string) => void;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ foods, onDelete }) => {
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
  });

  const totalNutrition = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.nutrition.calories,
      protein: acc.protein + food.nutrition.protein,
      carbs: acc.carbs + food.nutrition.carbs,
      fat: acc.fat + food.nutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

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

  const chartData = [
    {
      name: "Energy",
      value: totalNutrition.calories,
      target: targets.calories,
      color: "#8B5CF6", // Vivid Purple
    },
    {
      name: "Protein",
      value: totalNutrition.protein,
      target: targets.protein,
      color: "#D946EF", // Magenta Pink
    },
    {
      name: "Net Carbs",
      value: totalNutrition.carbs,
      target: targets.carbs,
      color: "#F97316", // Bright Orange
    },
    {
      name: "Fat",
      value: totalNutrition.fat,
      target: targets.fat,
      color: "#0EA5E9", // Ocean Blue
    },
  ];

  return (
    <Card className="p-6 animate-fade-up">
      <h3 className="text-xl font-semibold mb-6">Daily Progress</h3>
      <NutritionBarChart data={chartData} />

      <div className="mt-8">
        <h4 className="font-medium mb-2">Foods Detected</h4>
        <ul className="space-y-2">
          {foods.map((food) => (
            <li
              key={food.id}
              className="flex justify-between items-center text-sm text-gray-600 py-2 border-b last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <span className="capitalize">{food.name}</span>
                <span>{food.weight_g}g</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(food.id)}
                className="h-8 w-8 text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};