import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTargets } from "@/utils/profileCalculations";
import { Scale } from "lucide-react";

export const WeightInput = () => {
  const [weight, setWeight] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to update your weight");
        return;
      }

      // Get current profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast.error("Profile not found");
        return;
      }

      // Calculate new targets based on updated weight
      const updatedProfile = {
        ...profile,
        weight_kg: parseFloat(weight),
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
          target_fat: newTargets.fat,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Weight and targets updated successfully");
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
      <form 
        onSubmit={handleSubmit}
        className="relative block w-full h-64 border-2 border-dashed border-primary rounded-lg hover:border-primary/80 transition-colors"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 space-y-4">
          <Scale className="h-12 w-12 text-primary" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Quick Weight Update</h3>
            <p className="text-sm text-gray-600">
              Enter your current weight to update your nutrition targets
            </p>
          </div>
          <div className="flex gap-2 w-full max-w-xs">
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="20"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight in kg"
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting || !weight}
              className="bg-primary hover:bg-primary/90"
            >
              Update
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};