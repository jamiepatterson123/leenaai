import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { MacroTargetInputs } from "./MacroTargetInputs";
import { calculateCaloriesFromMacros } from "@/utils/macroCalculations";

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

  const handleMacroChange = (macro: 'calories' | 'protein' | 'carbs' | 'fat', value: number) => {
    const newFormData = { ...formData, [`target_${macro}`]: value };
    
    if (macro !== 'calories') {
      const totalCalories = calculateCaloriesFromMacros(
        newFormData.target_protein,
        newFormData.target_carbs,
        newFormData.target_fat
      );
      newFormData.target_calories = totalCalories;
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
          <MacroTargetInputs
            calories={formData.target_calories}
            protein={formData.target_protein}
            carbs={formData.target_carbs}
            fat={formData.target_fat}
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