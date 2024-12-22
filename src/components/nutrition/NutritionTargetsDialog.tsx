import React from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NutritionTargetsFormData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionTargetsDialogProps {
  currentTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  trigger: React.ReactNode;
}

export const NutritionTargetsDialog = ({ currentTargets, trigger }: NutritionTargetsDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm<NutritionTargetsFormData>({
    defaultValues: currentTargets,
  });

  const onSubmit = async (data: NutritionTargetsFormData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          target_calories: data.calories,
          target_protein: data.protein,
          target_carbs: data.carbs,
          target_fat: data.fat,
        })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast.success("Nutrition targets updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error) {
      console.error("Error updating nutrition targets:", error);
      toast.error("Failed to update nutrition targets");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Custom Nutrition Targets</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calories">Daily Calories (kcal)</Label>
            <Input
              id="calories"
              type="number"
              {...register("calories", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              {...register("protein", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              {...register("carbs", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              {...register("fat", { valueAsNumber: true })}
            />
          </div>
          <Button type="submit" className="w-full">Save Targets</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};