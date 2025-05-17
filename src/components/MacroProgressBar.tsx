
import React from "react";
import { Progress } from "./ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

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

  const getNutrientInfo = () => {
    switch (label) {
      case "Calories":
        return {
          title: "Calories",
          description: "Calories are units of energy. Your body needs calories to function properly. Tracking calories helps you maintain, gain, or lose weight depending on your fitness goals. For weight loss, consume fewer calories than you burn. For maintenance, balance intake with output. For muscle gain, consume slightly more than you need."
        };
      case "Protein":
        return {
          title: "Protein",
          description: "Proteins are essential nutrients made of amino acids. They are the building blocks of muscle tissue and vital for recovery after exercise. Aim for 1.6-2.2g per kg of body weight if you're active. Good sources include lean meats, eggs, dairy, legumes, and plant-based protein sources."
        };
      case "Carbs":
        return {
          title: "Carbohydrates",
          description: "Carbs are your body's primary energy source, especially for high-intensity exercise. They fuel your brain, muscles, and other organs. Focus on complex carbs like whole grains, fruits, and vegetables for sustained energy. Time carb intake around workouts for optimal performance."
        };
      case "Fat":
        return {
          title: "Fat",
          description: "Dietary fats are essential for hormone production, nutrient absorption, and cell health. They provide more than twice the energy per gram compared to carbs and protein. Prioritize unsaturated fats from sources like avocados, nuts, seeds, and olive oil. Limit saturated and trans fats for better heart health."
        };
      default:
        return {
          title: label,
          description: "This nutrient is important to track for optimal health and performance. Consult a nutrition professional for personalized advice."
        };
    }
  };

  const nutrientInfo = getNutrientInfo();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Popover>
          <PopoverTrigger asChild>
            <span className="text-sm font-medium cursor-pointer hover:text-primary transition-colors">
              {label}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-lg">{nutrientInfo.title}</h4>
              <p className="text-sm text-muted-foreground">{nutrientInfo.description}</p>
            </div>
          </PopoverContent>
        </Popover>
        <div className="text-sm text-muted-foreground">
          {current.toFixed(1)} / {target.toFixed(1)}
          <span className="ml-2">{percentage}%</span>
        </div>
      </div>
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
        {color === "bg-primary" || color === "bg-green-500" ? (
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
