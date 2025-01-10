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
  protein_percentage: number;
  carbs_percentage: number;
  fat_percentage: number;
}

export const CustomTargets = ({ initialData }: { initialData?: Partial<CustomTargetsFormData> }) => {
  const queryClient = useQueryClient();
  const { register, watch, setValue, handleSubmit } = useForm<CustomTargetsFormData>({
    defaultValues: {
      target_calories: initialData?.target_calories || undefined,
      target_protein: initialData?.target_protein || undefined,
      target_carbs: initialData?.target_carbs || undefined,
      target_fat: initialData?.target_fat || undefined,
      protein_percentage: 30,
      carbs_percentage: 40,
      fat_percentage: 30,
    },
  });

  // Watch all form fields
  const watchCalories = watch("target_calories");
  const watchProtein = watch("target_protein");
  const watchCarbs = watch("target_carbs");
  const watchFat = watch("target_fat");
  const watchProteinPercentage = watch("protein_percentage");
  const watchCarbsPercentage = watch("carbs_percentage");
  const watchFatPercentage = watch("fat_percentage");

  // Calculate placeholders based on calories and percentages
  const getPlaceholders = (calories: number | undefined) => {
    if (!calories) return { protein: "", carbs: "", fat: "" };
    
    return {
      protein: Math.round((calories * (watchProteinPercentage / 100)) / 4),
      carbs: Math.round((calories * (watchCarbsPercentage / 100)) / 4),
      fat: Math.round((calories * (watchFatPercentage / 100)) / 9),
    };
  };

  const placeholders = getPlaceholders(watchCalories);

  // Calculate calories from macros
  const calculateCaloriesFromMacros = (protein: number, carbs: number, fat: number) => {
    return (protein * 4) + (carbs * 4) + (fat * 9);
  };

  // Validate macro distribution
  const validateMacroDistribution = (calories: number, protein: number, carbs: number, fat: number) => {
    const calculatedCalories = calculateCaloriesFromMacros(protein, carbs, fat);
    return Math.abs(calories - calculatedCalories) < 10; // Allow for small rounding differences
  };

  // Handle percentage changes
  React.useEffect(() => {
    const totalPercentage = watchProteinPercentage + watchCarbsPercentage + watchFatPercentage;
    if (totalPercentage !== 100) {
      toast.error("Macro percentages must sum to 100%");
      return;
    }

    if (watchCalories) {
      const newProtein = Math.round((watchCalories * (watchProteinPercentage / 100)) / 4);
      const newCarbs = Math.round((watchCalories * (watchCarbsPercentage / 100)) / 4);
      const newFat = Math.round((watchCalories * (watchFatPercentage / 100)) / 9);

      setValue("target_protein", newProtein);
      setValue("target_carbs", newCarbs);
      setValue("target_fat", newFat);
    }
  }, [watchProteinPercentage, watchCarbsPercentage, watchFatPercentage, watchCalories, setValue]);

  // Handle calorie updates
  React.useEffect(() => {
    if (watchCalories) {
      const currentProtein = watchProtein;
      const currentCarbs = watchCarbs;
      const currentFat = watchFat;

      if (!currentProtein && !currentCarbs && !currentFat) {
        const proteinCalories = watchCalories * (watchProteinPercentage / 100);
        const carbsCalories = watchCalories * (watchCarbsPercentage / 100);
        const fatCalories = watchCalories * (watchFatPercentage / 100);

        setValue("target_protein", Math.round(proteinCalories / 4));
        setValue("target_carbs", Math.round(carbsCalories / 4));
        setValue("target_fat", Math.round(fatCalories / 9));
      }
    }
  }, [watchCalories, setValue, watchProteinPercentage, watchCarbsPercentage, watchFatPercentage]);

  // Handle individual macro updates
  React.useEffect(() => {
    if (!watchCalories && (watchProtein || watchCarbs || watchFat)) {
      const currentProtein = watchProtein || 0;
      const currentCarbs = watchCarbs || 0;
      const currentFat = watchFat || 0;

      const calculatedCalories = calculateCaloriesFromMacros(currentProtein, currentCarbs, currentFat);
      setValue("target_calories", Math.round(calculatedCalories));

      // Update percentages
      if (calculatedCalories > 0) {
        setValue("protein_percentage", Math.round((currentProtein * 4 / calculatedCalories) * 100));
        setValue("carbs_percentage", Math.round((currentCarbs * 4 / calculatedCalories) * 100));
        setValue("fat_percentage", Math.round((currentFat * 9 / calculatedCalories) * 100));
      }
    }
  }, [watchProtein, watchCarbs, watchFat, setValue]);

  const onSubmit = async (data: CustomTargetsFormData) => {
    try {
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
                placeholder={placeholders.protein.toString() || "Protein"}
                {...register("target_protein", { valueAsNumber: true })}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-20"
                  {...register("protein_percentage", { valueAsNumber: true })}
                />
                <span className="text-xs text-muted-foreground">% of calories</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_carbs">Carbs (g)</Label>
              <Input
                id="target_carbs"
                type="number"
                placeholder={placeholders.carbs.toString() || "Carbs"}
                {...register("target_carbs", { valueAsNumber: true })}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-20"
                  {...register("carbs_percentage", { valueAsNumber: true })}
                />
                <span className="text-xs text-muted-foreground">% of calories</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_fat">Fat (g)</Label>
              <Input
                id="target_fat"
                type="number"
                placeholder={placeholders.fat.toString() || "Fat"}
                {...register("target_fat", { valueAsNumber: true })}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  className="w-20"
                  {...register("fat_percentage", { valueAsNumber: true })}
                />
                <span className="text-xs text-muted-foreground">% of calories</span>
              </div>
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