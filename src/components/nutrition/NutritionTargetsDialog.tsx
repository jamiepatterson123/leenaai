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
import { MacroInputs } from "./targets/MacroInputs";
import { MacroDistribution } from "./targets/MacroDistribution";
import { CaloriesSummary } from "./targets/CaloriesSummary";

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
          <MacroInputs register={register} />
          <CaloriesSummary calculatedCalories={calculatedCalories} />
          <MacroDistribution
            protein={watchedValues.protein}
            carbs={watchedValues.carbs}
            fat={watchedValues.fat}
            calculatedCalories={calculatedCalories}
          />
          <Button type="submit" className="w-full">Save Targets</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};