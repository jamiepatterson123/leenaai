import React, { useState } from "react";
import { Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WeightInputProps {
  onSuccess?: () => void;
}

export const WeightInput = ({ onSuccess }: WeightInputProps) => {
  const [weight, setWeight] = useState<string>("");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertToKg = (value: number, fromUnit: "kg" | "lbs"): number => {
    if (fromUnit === "kg") return value;
    return value * 0.45359237; // Convert lbs to kg
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setIsSubmitting(true);
    try {
      const weightInKg = convertToKg(parseFloat(weight), unit);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ weight_kg: weightInKg })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      const { error: historyError } = await supabase
        .from("weight_history")
        .insert({
          user_id: user.id,
          weight_kg: weightInKg,
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
    <div className="w-full mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex flex-col items-center justify-center p-4 md:h-48 h-auto">
        <Scale className="h-6 w-6 text-primary mb-2 md:h-10 md:w-10 md:mb-3" strokeWidth={1} />
        <h3 className="text-base md:text-lg font-medium mb-3">Update Weight</h3>
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder={`Enter weight in ${unit}`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1"
            />
            <Select value={unit} onValueChange={(value) => setUnit(value as "kg" | "lbs")}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="lbs">lbs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
            disabled={isSubmitting || !weight}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </form>
      </div>
    </div>
  );
};