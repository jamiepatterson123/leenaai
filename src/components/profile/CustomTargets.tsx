import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface CustomTargetsFormData {
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

export const CustomTargets = ({ initialData }: { initialData?: Partial<CustomTargetsFormData> }) => {
  const { register, watch, setValue, handleSubmit } = useForm<CustomTargetsFormData>({
    defaultValues: {
      target_calories: initialData?.target_calories || 2000,
      target_protein: initialData?.target_protein || 150,
      target_carbs: initialData?.target_carbs || 200,
      target_fat: initialData?.target_fat || 70,
    },
  });

  // Fetch user's fitness goals
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("fitness_goals")
        .eq("user_id", user.id)
        .single();

      return data;
    },
  });

  const watchCalories = watch("target_calories");

  // Update macros when calories change
  React.useEffect(() => {
    if (!watchCalories || !profile?.fitness_goals) return;

    let proteinPercentage = 0.3;
    let carbsPercentage = 0.4;
    let fatPercentage = 0.3;

    // Adjust percentages based on fitness goals
    if (profile.fitness_goals === "weight_loss") {
      proteinPercentage = 0.4;
      carbsPercentage = 0.3;
      fatPercentage = 0.3;
    } else if (profile.fitness_goals === "muscle_gain") {
      proteinPercentage = 0.3;
      carbsPercentage = 0.5;
      fatPercentage = 0.2;
    }

    // Calculate macros in grams
    const proteinGrams = Math.round((watchCalories * proteinPercentage) / 4);
    const carbsGrams = Math.round((watchCalories * carbsPercentage) / 4);
    const fatGrams = Math.round((watchCalories * fatPercentage) / 9);

    setValue("target_protein", proteinGrams);
    setValue("target_carbs", carbsGrams);
    setValue("target_fat", fatGrams);
  }, [watchCalories, profile?.fitness_goals, setValue]);

  const onSubmit = async (data: CustomTargetsFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          target_calories: data.target_calories,
          target_protein: data.target_protein,
          target_carbs: data.target_carbs,
          target_fat: data.target_fat,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Macro targets updated successfully");
    } catch (error) {
      console.error("Error updating targets:", error);
      toast.error("Failed to update macro targets");
    }
  };

  // Calculate actual calories from macros
  const actualCalories = Math.round(
    (watch("target_protein") * 4) + 
    (watch("target_carbs") * 4) + 
    (watch("target_fat") * 9)
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Custom Macro Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target_calories">Daily Calorie Target</Label>
            <Input
              id="target_calories"
              type="number"
              {...register("target_calories", { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_protein">Protein (g)</Label>
              <Input
                id="target_protein"
                type="number"
                {...register("target_protein", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_carbs">Carbs (g)</Label>
              <Input
                id="target_carbs"
                type="number"
                {...register("target_carbs", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_fat">Fat (g)</Label>
              <Input
                id="target_fat"
                type="number"
                {...register("target_fat", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm">
              <span className="text-muted-foreground">Actual Calories from Macros: </span>
              <span className="font-medium">{actualCalories} kcal</span>
              {Math.abs(actualCalories - watchCalories) > 5 && (
                <p className="text-yellow-500 text-xs mt-1">
                  Note: Actual calories from macros differ from target by {Math.abs(actualCalories - watchCalories)} kcal
                </p>
              )}
            </div>
            <Button type="submit">Save Targets</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};