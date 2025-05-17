
import React from "react";
import { Card } from "@/components/ui/card";

interface MacroRingProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories: number;
}

export const MacroRing: React.FC<MacroRingProps> = ({
  calories,
  protein,
  carbs,
  fat,
  targetCalories,
}) => {
  // Convert macros to calories for proportion calculation
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  const totalCalories = proteinCalories + carbsCalories + fatCalories;

  // Calculate the percentage of the circle each macro should take
  const proteinDegrees = (proteinCalories / totalCalories) * 360;
  const carbsDegrees = (carbsCalories / totalCalories) * 360;
  const fatDegrees = (fatCalories / totalCalories) * 360;

  // Calculate starting points for each segment
  const carbsStart = proteinDegrees;
  const fatStart = proteinDegrees + carbsDegrees;

  return (
    <Card className="p-6 w-full max-w-sm mx-auto">
      <div className="relative w-48 h-48 mx-auto">
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
        
        {/* Macro segments */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 -rotate-90 transform"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#proteinGradient)"
            strokeWidth="20"
            strokeDasharray={`${(proteinDegrees / 360) * 251.2} 251.2`}
            className="transition-all duration-500"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#eab308"
            strokeWidth="20"
            strokeDasharray={`${(carbsDegrees / 360) * 251.2} 251.2`}
            strokeDashoffset={`${-((proteinDegrees / 360) * 251.2)}`}
            className="transition-all duration-500"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            strokeDasharray={`${(fatDegrees / 360) * 251.2} 251.2`}
            strokeDashoffset={`${-(((proteinDegrees + carbsDegrees) / 360) * 251.2)}`}
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="proteinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold">{Math.round(calories)}</span>
          <span className="text-sm text-muted-foreground">kcal</span>
        </div>
      </div>

      {/* Legend with gram targets */}
      <div className="mt-6 flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#D946EF] to-[#8B5CF6]"></div>
          <span className="text-sm">Protein ({Math.round(protein)}g)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
          <span className="text-sm">Carbs ({Math.round(carbs)}g)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
          <span className="text-sm">Fat ({Math.round(fat)}g)</span>
        </div>
      </div>
    </Card>
  );
};
