import React, { useState } from "react";
import { Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTargets } from "@/utils/profileCalculations";

export const WeightInput = () => {
  const [weight, setWeight] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // First get the current profile to calculate new targets
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("No profile found");

      // Calculate new targets with updated weight
      const updatedProfile = {
        ...profile,
        weight_kg: parseFloat(weight)
      };
      
      const newTargets = calculateTargets(updatedProfile);

      // Update profile with new weight and targets
      const { error } = await supabase
        .from("profiles")
        .update({ 
          weight_kg: parseFloat(weight),
          target_calories: newTargets.calories,
          target_protein: newTargets.protein,
          target_carbs: newTargets.carbs,
          target_fat: newTargets.fat
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Weight and nutrition targets updated successfully");
      setWeight("");
    } catch (error) {
      console.error("Error updating weight:", error);
      toast.error("Failed to update weight");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative block w-full h-64 border-2 border-dashed border-primary rounded-lg">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <Scale className="mx-auto h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-4">Update Your Weight</h3>
          <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="Enter weight in kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !weight}
            >
              {isSubmitting ? "Updating..." : "Update Weight"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};