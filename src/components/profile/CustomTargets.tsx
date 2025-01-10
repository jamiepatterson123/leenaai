import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CustomTargetsFormData {
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

export const CustomTargets = ({ initialData }: { initialData?: Partial<CustomTargetsFormData> }) => {
  const queryClient = useQueryClient();
  const { register, watch, setValue, handleSubmit } = useForm<CustomTargetsFormData>({
    defaultValues: {
      target_calories: initialData?.target_calories || undefined,
      target_protein: initialData?.target_protein || undefined,
      target_carbs: initialData?.target_carbs || undefined,
      target_fat: initialData?.target_fat || undefined,
    },
  });

  // Watch all form fields
  const watchCalories = watch("target_calories");
  const watchProtein = watch("target_protein");
  const watchCarbs = watch("target_carbs");
  const watchFat = watch("target_fat");

  // Calculate calories from macros
  const calculateCaloriesFromMacros = (protein: number, carbs: number, fat: number) => {
    return (protein * 4) + (carbs * 4) + (fat * 9);
  };

  // Validate macro distribution
  const validateMacroDistribution = (calories: number, protein: number, carbs: number, fat: number) => {
    const calculatedCalories = calculateCaloriesFromMacros(protein, carbs, fat);
    return Math.abs(calories - calculatedCalories) < 10; // Allow for small rounding differences
  };

  React.useEffect(() => {
    if (watchCalories) {
      const currentProtein = watchProtein;
      const currentCarbs = watchCarbs;
      const currentFat = watchFat;

      // Case 1: Only calories updated (use default ratios)
      if (!currentProtein && !currentCarbs && !currentFat) {
        const proteinCalories = watchCalories * 0.3;
        const carbsCalories = watchCalories * 0.4;
        const fatCalories = watchCalories * 0.3;

        setValue("target_protein", Math.round(proteinCalories / 4));
        setValue("target_carbs", Math.round(carbsCalories / 4));
        setValue("target_fat", Math.round(fatCalories / 9));
      }
      // Case 2: Protein is set with calories
      else if (currentProtein) {
        const proteinCalories = currentProtein * 4;
        const remainingCalories = watchCalories - proteinCalories;
        
        if (remainingCalories > 0) {
          // Split remaining calories between carbs (57%) and fat (43%)
          const carbsCalories = remainingCalories * 0.57;
          const fatCalories = remainingCalories * 0.43;

          setValue("target_carbs", Math.round(carbsCalories / 4));
          setValue("target_fat", Math.round(fatCalories / 9));
        }
      }
      // Case 3: Carbs or fat is set with calories
      else if (currentCarbs || currentFat) {
        const remainingCalories = watchCalories - 
          (currentCarbs ? currentCarbs * 4 : 0) - 
          (currentFat ? currentFat * 9 : 0);

        if (remainingCalories > 0) {
          if (!currentProtein) {
            setValue("target_protein", Math.round((remainingCalories * 0.5) / 4));
          }
          if (!currentCarbs) {
            setValue("target_carbs", Math.round((remainingCalories * 0.6) / 4));
          }
          if (!currentFat) {
            setValue("target_fat", Math.round((remainingCalories * 0.4) / 9));
          }
        }
      }
    }
  }, [watchCalories, setValue]);

  // Handle individual macro updates
  React.useEffect(() => {
    if (!watchCalories && (watchProtein || watchCarbs || watchFat)) {
      const currentProtein = watchProtein || 0;
      const currentCarbs = watchCarbs || 0;
      const currentFat = watchFat || 0;

      const calculatedCalories = calculateCaloriesFromMacros(currentProtein, currentCarbs, currentFat);
      setValue("target_calories", Math.round(calculatedCalories));
    }
  }, [watchProtein, watchCarbs, watchFat, setValue]);

  const onSubmit = async (data: CustomTargetsFormData) => {
    try {
      // Validate macro distribution
      if (!validateMacroDistribution(
        data.target_calories,
        data.target_protein,
        data.target_carbs,
        data.target_fat
      )) {
        toast.error("Macro distribution doesn't match calorie target. Please adjust your values.");
        return;
      }

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
      
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Macro targets updated successfully");
    } catch (error) {
      console.error("Error updating targets:", error);
      toast.error("Failed to update macro targets");
    }
  };

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
              placeholder="Enter daily calorie target"
              {...register("target_calories", { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="target_protein">Protein (g)</Label>
              <Input
                id="target_protein"
                type="number"
                placeholder="Protein"
                {...register("target_protein", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">30% of calories</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_carbs">Carbs (g)</Label>
              <Input
                id="target_carbs"
                type="number"
                placeholder="Carbs"
                {...register("target_carbs", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">40% of calories</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_fat">Fat (g)</Label>
              <Input
                id="target_fat"
                type="number"
                placeholder="Fat"
                {...register("target_fat", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">30% of calories</p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit">Save Targets</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};