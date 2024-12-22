import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";

interface MacroInputsProps {
  register: UseFormRegister<{
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export const MacroInputs: React.FC<MacroInputsProps> = ({ register }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="protein">Protein (g)</Label>
        <Input
          id="protein"
          type="number"
          step="1"
          {...register("protein", { 
            valueAsNumber: true,
            min: 0,
          })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="carbs">Carbs (g)</Label>
        <Input
          id="carbs"
          type="number"
          step="1"
          {...register("carbs", { 
            valueAsNumber: true,
            min: 0,
          })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fat">Fat (g)</Label>
        <Input
          id="fat"
          type="number"
          step="1"
          {...register("fat", { 
            valueAsNumber: true,
            min: 0,
          })}
        />
      </div>
    </div>
  );
};