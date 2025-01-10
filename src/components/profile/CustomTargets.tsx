import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { MacroPercentageInputs } from "./MacroPercentageInputs";
import { MacroTargetInputs } from "./MacroTargetInputs";
import { 
  calculateMacrosFromCalories, 
  calculateCaloriesFromMacros,
  validateMacroPercentages 
} from "@/utils/macroCalculations";

interface CustomTargetsFormData {
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

export const CustomTargets = ({ initialData }: { initialData?: Partial<CustomTargetsFormData> }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CustomTargetsFormData>({
    target_calories: initialData?.target_calories || 0,
    target_protein: initialData?.target_protein || 0,
    target_carbs: initialData?.target_carbs || 0,
    target_fat: initialData?.target_fat || 0,
  });

  const [percentages, setPercentages] = useState({
    protein: 30,
    carbs: 40,
    fat: 30,
  });

  const [placeholders, setPlaceholders] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    if (formData.target_calories) {
      const macros = calculateMacrosFromCalories(
        formData.target_calories,
        percentages.protein,
        percentages.carbs,
        percentages.fat
      );
      setPlaceholders(macros);
    }
  }, [formData.target_calories, percentages]);

  const handlePercentageChange = (macro: 'protein' | 'carbs' | 'fat', value: number) => {
    const newPercentages = { ...percentages, [macro]: value };
    if (validateMacroPercentages(newPercentages.protein, newPercentages.carbs, newPercentages.fat)) {
      setPercentages(newPercentages);
      if (formData.target_calories) {
        const macros = calculateMacrosFromCalories(
          formData.target_calories,
          newPercentages.protein,
          newPercentages.carbs,
          newPercentages.fat
        );
        setFormData({
          ...formData,
          target_protein: macros.protein,
          target_carbs: macros.carbs,
          target_fat: macros.fat,
        });
      }
    } else {
      toast.error("Macro percentages must sum to 100%");
    }
  };

  const handleMacroChange = (macro: 'calories' | 'protein' | 'carbs' | 'fat', value: number) => {
    const newFormData = { ...formData, [`target_${macro}`]: value };
    
    if (macro === 'calories') {
      const macros = calculateMacrosFromCalories(
        value,
        percentages.protein,
        percentages.carbs,
        percentages.fat
      );
      newFormData.target_protein = macros.protein;
      newFormData.target_carbs = macros.carbs;
      newFormData.target_fat = macros.fat;
    } else {
      const totalCalories = calculateCaloriesFromMacros(
        newFormData.target_protein,
        newFormData.target_carbs,
        newFormData.target_fat
      );
      newFormData.target_calories = totalCalories;
      
      // Update percentages
      const proteinPercentage = (newFormData.target_protein * 4 / totalCalories) * 100;
      const carbsPercentage = (newFormData.target_carbs * 4 / totalCalories) * 100;
      const fatPercentage = (newFormData.target_fat * 9 / totalCalories) * 100;
      
      setPercentages({
        protein: Math.round(proteinPercentage),
        carbs: Math.round(carbsPercentage),
        fat: Math.round(fatPercentage),
      });
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          target_calories: formData.target_calories,
          target_protein: formData.target_protein,
          target_carbs: formData.target_carbs,
          target_fat: formData.target_fat,
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
    <Card>
      <CardHeader>
        <CardTitle>Custom Macro Targets</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <MacroPercentageInputs
            proteinPercentage={percentages.protein}
            carbsPercentage={percentages.carbs}
            fatPercentage={percentages.fat}
            onPercentageChange={handlePercentageChange}
          />
          
          <MacroTargetInputs
            calories={formData.target_calories}
            protein={formData.target_protein}
            carbs={formData.target_carbs}
            fat={formData.target_fat}
            placeholders={placeholders}
            onMacroChange={handleMacroChange}
          />

          <div className="flex justify-end mt-6">
            <Button type="submit">Save Targets</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};