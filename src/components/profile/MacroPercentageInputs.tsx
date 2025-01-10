import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MacroPercentageInputsProps {
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
  onPercentageChange: (macro: 'protein' | 'carbs' | 'fat', value: number) => void;
}

export const MacroPercentageInputs: React.FC<MacroPercentageInputsProps> = ({
  proteinPercentage,
  carbsPercentage,
  fatPercentage,
  onPercentageChange,
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="protein_percentage">Protein %</Label>
        <Input
          id="protein_percentage"
          type="number"
          min="0"
          max="100"
          value={proteinPercentage}
          onChange={(e) => onPercentageChange('protein', Number(e.target.value))}
          className="w-20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="carbs_percentage">Carbs %</Label>
        <Input
          id="carbs_percentage"
          type="number"
          min="0"
          max="100"
          value={carbsPercentage}
          onChange={(e) => onPercentageChange('carbs', Number(e.target.value))}
          className="w-20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fat_percentage">Fat %</Label>
        <Input
          id="fat_percentage"
          type="number"
          min="0"
          max="100"
          value={fatPercentage}
          onChange={(e) => onPercentageChange('fat', Number(e.target.value))}
          className="w-20"
        />
      </div>
    </div>
  );
};