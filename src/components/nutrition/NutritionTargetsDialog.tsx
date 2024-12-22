import React, { useState, useEffect } from "react";
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
import { MacroProgressBar } from "../MacroProgressBar";

interface NutritionTargetsFormData {
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

const calculateCalories = (protein: number, carbs: number, fat: number) => {
  return protein * 4 + carbs * 4 + fat * 9;
};

export const NutritionTargetsDialog = ({ currentTargets, trigger }: NutritionTargetsDialogProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState(currentTargets.calories);
  const { register, handleSubmit, watch } = useForm<NutritionTargetsFormData>({
    defaultValues: {
      protein: currentTargets.protein,
      carbs: currentTargets.carbs,
      fat: currentTargets.fat,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const newCalories = calculateCalories(
      watchedValues.protein,
      watchedValues.carbs,
      watchedValues.fat
    );
    setCalculatedCalories(newCalories);
  }, [watchedValues]);

  const onSubmit = async (data: NutritionTargetsFormData) => {
    try {
      const calories = calculateCalories(data.protein, data.carbs, data.fat);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          target_calories: calories,
          target_protein: data.protein,
          target_carbs: data.carbs,
          target_fat: data.fat,
        })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast.success("Nutrition targets updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating nutrition targets:", error);
      toast.error("Failed to update nutrition targets");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Custom Nutrition Targets</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="1"
                {...register("protein", { 
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="1"
                {...register("carbs", { 
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                step="1"
                {...register("fat", { 
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm font-medium">
              Calculated Daily Calories: {Math.round(calculatedCalories)} kcal
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Macro Distribution</div>
              <div className="space-y-2">
                <MacroProgressBar
                  label="Protein"
                  current={(watchedValues.protein * 4 / calculatedCalories) * 100}
                  target={30}
                  color="bg-green-500"
                />
                <MacroProgressBar
                  label="Carbs"
                  current={(watchedValues.carbs * 4 / calculatedCalories) * 100}
                  target={50}
                  color="bg-yellow-500"
                />
                <MacroProgressBar
                  label="Fat"
                  current={(watchedValues.fat * 9 / calculatedCalories) * 100}
                  target={20}
                  color="bg-red-500"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">Save Targets</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};