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
  const percentage = Math.round((current / target) * 100);

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <div className="text-sm text-muted-foreground">
          {current.toFixed(1)} / {target.toFixed(1)}
          <span className="ml-2">{percentage}%</span>
        </div>
      </div>
      <Progress value={percentage} className={`h-3 ${color}`} />
    </div>
  );
};