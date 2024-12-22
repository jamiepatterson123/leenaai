import React from "react";
import { MacroProgressBar } from "../../MacroProgressBar";

interface MacroDistributionProps {
  protein: number;
  carbs: number;
  fat: number;
  calculatedCalories: number;
}

export const MacroDistribution: React.FC<MacroDistributionProps> = ({
  protein,
  carbs,
  fat,
  calculatedCalories,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Macro Distribution</div>
      <div className="space-y-2">
        <MacroProgressBar
          label="Protein"
          current={(protein * 4 / calculatedCalories) * 100}
          target={30}
          color="bg-green-500"
        />
        <MacroProgressBar
          label="Carbs"
          current={(carbs * 4 / calculatedCalories) * 100}
          target={50}
          color="bg-yellow-500"
        />
        <MacroProgressBar
          label="Fat"
          current={(fat * 9 / calculatedCalories) * 100}
          target={20}
          color="bg-red-500"
        />
      </div>
    </div>
  );
};