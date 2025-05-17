
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { MacroTargetInputs } from "./MacroTargetInputs";
import { calculateCaloriesFromMacros } from "@/utils/macroCalculations";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <div className="flex items-center gap-2">
          <CardTitle>Custom Macro Targets</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-full w-6 h-6 hover:bg-gray-100 transition-colors">
                  <Info className="h-4 w-4 text-gray-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>If you already know your calorie and macro targets, you can add them here</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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

          <div className="mt-6">
            <Button type="submit" variant="gradient" className="w-full font-semibold">Save Targets</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
