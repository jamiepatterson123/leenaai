import React from "react";

interface MacroCircleProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({
  label,
  current,
  target,
  unit = "g",
  color = "bg-primary"
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  const strokeWidth = "border-4";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 mb-1">
        <div className={`absolute inset-0 rounded-full ${strokeWidth} border-muted`} />
        <div
          className={`absolute inset-0 rounded-full ${strokeWidth} ${color} transition-all duration-500`}
          style={{
            clipPath: `polygon(50% 50%, -50% 50%, -50% -50%, 50% -50%, 50% ${percentage}%)`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm font-semibold">{Math.round(current)}</div>
          </div>
        </div>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
    </div>
  );
};