import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MacroTargetInputsProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onMacroChange: (macro: 'calories' | 'protein' | 'carbs' | 'fat', value: number) => void;
}

export const MacroTargetInputs: React.FC<MacroTargetInputsProps> = ({
  calories = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
  onMacroChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="target_calories">Daily Calorie Target</Label>
        <Input
          id="target_calories"
          type="number"
          placeholder="Enter daily calorie target"
          value={calories || ''}
          onChange={(e) => onMacroChange('calories', Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="space-y-2">
          <Label htmlFor="target_protein">Protein (g)</Label>
          <Input
            id="target_protein"
            type="number"
            placeholder="Enter protein target"
            value={protein || ''}
            onChange={(e) => onMacroChange('protein', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_carbs">Carbs (g)</Label>
          <Input
            id="target_carbs"
            type="number"
            placeholder="Enter carbs target"
            value={carbs || ''}
            onChange={(e) => onMacroChange('carbs', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_fat">Fat (g)</Label>
          <Input
            id="target_fat"
            type="number"
            placeholder="Enter fat target"
            value={fat || ''}
            onChange={(e) => onMacroChange('fat', Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};