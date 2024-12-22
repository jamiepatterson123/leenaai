import React from "react";
import { Progress } from "@/components/ui/progress";

interface MacroCircleProps {
  current: number;
  target: number;
  label: string;
  unit?: string;
  color?: string;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({
  current,
  target,
  label,
  unit = "g",
  color = "bg-primary"
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const size = "h-48 w-48";
  const strokeWidth = "border-8";

  return (
    <div className="relative flex items-center justify-center">
      <div className={`${size} rounded-full ${strokeWidth} border-muted flex items-center justify-center`}>
        <div className={`absolute inset-0 rounded-full ${strokeWidth} ${color} transition-all duration-500`}
             style={{
               clipPath: `polygon(50% 50%, -50% 50%, -50% -50%, 50% -50%, 50% ${percentage}%)`
             }}
        />
        <div className="text-center z-10">
          <div className="text-3xl font-bold">{Math.round(current)}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{`${unit} / ${Math.round(target)}${unit}`}</div>
        </div>
      </div>
    </div>
  );
};