import React from "react";

interface ProgressBarProps {
  current: number;
  target: number;
  color: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  color,
}) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="h-6 bg-gray-100 rounded-full w-full">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};