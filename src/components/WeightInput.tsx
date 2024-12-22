import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Weight Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Current Weight (kg)</Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="20"
                max="300"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your weight"
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || !weight}
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};