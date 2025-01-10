import React from "react";

interface MacroCircleProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
  isCalories?: boolean;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({
  label,
  current,
  target,
  unit = "g",
  color = "bg-primary",
  isCalories = false
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const radius = 35; // SVG circle radius
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="fill-none stroke-muted"
            strokeWidth="5"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className={`fill-none ${color}`}
            strokeWidth="5"
            style={{
              strokeDasharray,
              transition: "stroke-dasharray 0.5s ease-in-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-sm font-semibold">
            {Math.round(current)}
            {isCalories ? "" : unit}
          </span>
          {isCalories && (
            <span className="text-xs text-muted-foreground">kcal</span>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};