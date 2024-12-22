import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CustomTargetsFormData {
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

export const CustomTargets = ({ initialData }: { initialData?: Partial<CustomTargetsFormData> }) => {
  const { register, watch, handleSubmit } = useForm<CustomTargetsFormData>({
    defaultValues: {
      target_protein: initialData?.target_protein || 150,
      target_carbs: initialData?.target_carbs || 200,
      target_fat: initialData?.target_fat || 70,
    },
  });

  const watchProtein = watch("target_protein");
  const watchCarbs = watch("target_carbs");
  const watchFat = watch("target_fat");

  // Calculate total calories (4 calories per gram of protein/carbs, 9 calories per gram of fat)
  const totalCalories = (watchProtein * 4) + (watchCarbs * 4) + (watchFat * 9);

  const onSubmit = async (data: CustomTargetsFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          target_protein: data.target_protein,
          target_carbs: data.target_carbs,
          target_fat: data.target_fat,
          target_calories: totalCalories,
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
              <span className="text-muted-foreground">Total Calories: </span>
              <span className="font-medium">{Math.round(totalCalories)} kcal</span>
            </div>
            <Button type="submit">Save Targets</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};