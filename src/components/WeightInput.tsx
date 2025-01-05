import React, { useState } from "react";
import { Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WeightInputProps {
  onSuccess?: () => void;
}

export const WeightInput = ({ onSuccess }: WeightInputProps) => {
  const [weight, setWeight] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ weight_kg: parseFloat(weight) })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      const { error: historyError } = await supabase
        .from("weight_history")
        .insert({
          user_id: user.id,
          weight_kg: parseFloat(weight),
        });

      if (historyError) throw historyError;

      toast.success("Weight updated successfully");
      setWeight("");
      onSuccess?.();
    } catch (error) {
      console.error("Error updating weight:", error);
      toast.error("Failed to update weight");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative block w-full max-w-md mx-auto h-64 border border-solid border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <Scale className="h-12 w-12 text-primary mb-4" strokeWidth={1} />
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
            className="w-full text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
            disabled={isSubmitting || !weight}
          >
            {isSubmitting ? "Updating..." : "Update Weight"}
          </Button>
        </form>
      </div>
    </div>
  );
};