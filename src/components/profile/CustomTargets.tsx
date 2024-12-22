import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const watchCalories = watch("target_calories");

  // Update macros when calories change
  React.useEffect(() => {
    if (watchCalories) {
      // Protein: 30% of calories (4 calories per gram)
      const proteinCalories = watchCalories * 0.3;
      const protein = Math.round(proteinCalories / 4);
      
      // Fat: 25% of calories (9 calories per gram)
      const fatCalories = watchCalories * 0.25;
      const fat = Math.round(fatCalories / 9);
      
      // Remaining calories go to carbs (4 calories per gram)
      const carbsCalories = watchCalories - proteinCalories - fatCalories;
      const carbs = Math.round(carbsCalories / 4);

      setValue("target_protein", protein);
      setValue("target_carbs", carbs);
      setValue("target_fat", fat);
    }
  }, [watchCalories, setValue]);

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
            <p className="text-sm text-muted-foreground">
              Enter your daily calorie target and macro targets will be automatically calculated
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="target_protein">Protein (g)</Label>
              <Input
                id="target_protein"
                type="number"
                {...register("target_protein", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">30% of calories</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_carbs">Carbs (g)</Label>
              <Input
                id="target_carbs"
                type="number"
                {...register("target_carbs", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">45% of calories</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_fat">Fat (g)</Label>
              <Input
                id="target_fat"
                type="number"
                {...register("target_fat", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">25% of calories</p>
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