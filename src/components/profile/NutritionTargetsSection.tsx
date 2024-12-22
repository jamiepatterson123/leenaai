import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NutritionTargetsSectionProps {
  initialTargets: {
    protein: number;
    carbs: number;
    fat: number;
  };
  onUpdate: () => Promise<void>;
}

export const NutritionTargetsSection: React.FC<NutritionTargetsSectionProps> = ({
  initialTargets,
  onUpdate
}) => {
  const [customTargets, setCustomTargets] = useState(initialTargets);
  const [displayedCalories, setDisplayedCalories] = useState(() => 
    initialTargets.protein * 4 + initialTargets.carbs * 4 + initialTargets.fat * 9
  );

  const calculateCalories = () => {
    return customTargets.protein * 4 + customTargets.carbs * 4 + customTargets.fat * 9;
  };

  const handleTargetsSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const calories = calculateCalories();
      const { error } = await supabase
        .from("profiles")
        .update({
          target_calories: calories,
          target_protein: customTargets.protein,
          target_carbs: customTargets.carbs,
          target_fat: customTargets.fat,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setDisplayedCalories(calories);
      toast.success("Nutrition targets updated successfully");
      await onUpdate();
    } catch (error) {
      console.error("Error updating nutrition targets:", error);
      toast.error("Failed to update nutrition targets");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Custom Nutrition Targets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="protein">Protein (g)</Label>
            <Input
              id="protein"
              type="number"
              value={customTargets.protein}
              onChange={(e) => setCustomTargets(prev => ({ 
                ...prev, 
                protein: Number(e.target.value) 
              }))}
              className="text-2xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carbs">Carbs (g)</Label>
            <Input
              id="carbs"
              type="number"
              value={customTargets.carbs}
              onChange={(e) => setCustomTargets(prev => ({ 
                ...prev, 
                carbs: Number(e.target.value) 
              }))}
              className="text-2xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fat">Fat (g)</Label>
            <Input
              id="fat"
              type="number"
              value={customTargets.fat}
              onChange={(e) => setCustomTargets(prev => ({ 
                ...prev, 
                fat: Number(e.target.value) 
              }))}
              className="text-2xl h-12"
            />
          </div>
          <div className="pt-2">
            <div className="text-lg">Calculated Daily Calories</div>
            <div className="text-3xl font-medium">{Math.round(displayedCalories)} kcal</div>
          </div>
          <Button 
            onClick={handleTargetsSubmit}
            className="w-full mt-4"
          >
            Save Targets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};