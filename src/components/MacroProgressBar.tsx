
import React from "react";
import { Progress } from "./ui/progress";

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  current,
  target,
  color,
}) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <div className="text-sm text-muted-foreground">
          {current.toFixed(1)} / {target.toFixed(1)}
          <span className="ml-2">{percentage}%</span>
        </div>
      </div>
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
        {color === "bg-primary" ? (
          <div 
            className="h-full bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        ) : (
          <div 
            className={`h-full ${color} transition-all duration-300 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};
