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
    <div className="w-full mx-auto">
      <div className="flex flex-col items-center justify-center p-3">
        <Scale className="h-5 w-5 text-gray-400 mb-2" strokeWidth={1.5} />
        <form onSubmit={handleSubmit} className="w-full max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder={`Enter weight in ${unit}`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 h-9"
            />
            <Select value={unit} onValueChange={(value) => setUnit(value as "kg" | "lbs")}>
              <SelectTrigger className="w-16 h-9">
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
            className="w-full h-9 text-white bg-green-600 hover:bg-green-700 transition-all duration-200"
            disabled={isSubmitting || !weight}
          >
            {isSubmitting ? "..." : "Update"}
          </Button>
        </form>
      </div>
    </div>
  );
};