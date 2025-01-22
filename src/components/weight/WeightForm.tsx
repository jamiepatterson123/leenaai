import React, { useState } from "react";
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

interface WeightFormProps {
  onSuccess?: () => void;
}

export const WeightForm = ({ onSuccess }: WeightFormProps) => {
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
    <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
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
          <SelectTrigger className="w-24">
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
        className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
        disabled={isSubmitting || !weight}
      >
        {isSubmitting ? "Updating..." : "Update Weight"}
      </Button>
    </form>
  );
};