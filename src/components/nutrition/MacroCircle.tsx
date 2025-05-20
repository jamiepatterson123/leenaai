import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

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
  color = "stroke-primary",
  isCalories = false
}) => {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const percentage = Math.min((current / target) * 100, 100);
  const displayPercentage = Math.round((current / target) * 100);
  const isOverTarget = current > target;
  
  const radius = 35; // SVG circle radius
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;

  const getMacroInfo = () => {
    switch (label) {
      case "Calories":
        return {
          title: "Daily Caloric Intake",
          description: "Calories are energy units that fuel all bodily functions. Your target is calculated based on your BMR, activity level, and fitness goals. Maintaining an appropriate caloric intake is essential for weight management and energy levels throughout the day.",
          importance: "Tracking calories helps ensure you're fueling your body appropriately for your activity level and goals, whether that's weight loss, maintenance, or muscle gain."
        };
      case "Protein":
        return {
          title: "Daily Protein Intake",
          description: "Protein is essential for muscle repair and growth. Your target is calculated based on your weight and activity level. Adequate protein intake supports recovery from exercise, maintains lean muscle mass, and helps control hunger.",
          importance: "Higher protein intake is linked to better body composition, improved recovery, and greater satiety, helping you stay on track with your nutrition goals."
        };
      case "Carbs":
        return {
          title: "Daily Carbohydrate Intake",
          description: "Carbohydrates are your body's preferred energy source. Your target is calculated based on your total caloric needs and macronutrient distribution. Carbs fuel high-intensity exercise and support brain function.",
          importance: "Strategic carb intake can optimize performance, recovery, and energy levels throughout the day while supporting your overall health and fitness goals."
        };
      case "Fat":
        return {
          title: "Daily Fat Intake",
          description: "Dietary fats are essential for hormone production, nutrient absorption, and cell health. Your target is calculated as part of a balanced macronutrient profile. Healthy fats support overall health and provide sustained energy.",
          importance: "Adequate fat intake supports hormonal balance, brain health, and satisfaction from meals, helping you maintain consistent energy levels throughout the day."
        };
      default:
        return {
          title: `Daily ${label} Intake`,
          description: `This nutrient is important for your overall health and fitness goals. Your target is calculated based on your personal profile and needs.`,
          importance: "Tracking your intake helps ensure you're meeting your body's needs for optimal health and performance."
        };
    }
  };

  const macroInfo = getMacroInfo();

  const content = (
    <div className="space-y-3 p-2">
      <h3 className="font-bold text-lg">{macroInfo.title}</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="font-medium">Current:</span>
          <span>{Math.round(current)}{isCalories ? " kcal" : unit}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Target:</span>
          <span>{target}{isCalories ? " kcal" : unit}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Progress:</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="space-y-2 mt-2">
        <h4 className="font-semibold">Why It Matters:</h4>
        <p className="text-sm text-muted-foreground">{macroInfo.importance}</p>
        <p className="text-sm text-muted-foreground">{macroInfo.description}</p>
      </div>
    </div>
  );

  // Render different components based on device type
  if (isMobile) {
    return (
      <div className="flex flex-col items-center">
        <div 
          className="relative w-20 h-20 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="fill-none stroke-muted"
              strokeWidth="5"
            />
            {/* Progress circle with gradient */}
            <defs>
              <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D946EF" /> {/* Vibrant Pink */}
                <stop offset="100%" stopColor="#8B5CF6" /> {/* Vibrant Purple */}
              </linearGradient>
            </defs>
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="fill-none"
              stroke={`url(#gradient-${label})`}
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
            <span className={`text-xs ${isOverTarget ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {displayPercentage}%
            </span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
          {label}
        </span>

        {/* Dialog for mobile */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogTitle className="text-center">{label} Tracking</DialogTitle>
            {content}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Desktop version with popover
  return (
    <div className="flex flex-col items-center">
      <Popover>
        <PopoverTrigger asChild>
          <div className="relative w-20 h-20 cursor-pointer">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="fill-none stroke-muted"
                strokeWidth="5"
              />
              {/* Progress circle with gradient */}
              <defs>
                <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D946EF" /> {/* Vibrant Pink */}
                  <stop offset="100%" stopColor="#8B5CF6" /> {/* Vibrant Purple */}
                </linearGradient>
              </defs>
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="fill-none"
                stroke={`url(#gradient-${label})`}
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
              <span className={`text-xs ${isOverTarget ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                {displayPercentage}%
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80">{content}</PopoverContent>
      </Popover>
      <span className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};
