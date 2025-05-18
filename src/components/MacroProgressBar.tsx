
import React from "react";
import { Progress } from "./ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
          title: "Calories: The Science",
          description: "Calories are energy units that fuel all bodily functions. Research shows that energy balance (calories in vs. calories out) is the fundamental principle governing weight management. Your Basal Metabolic Rate (BMR) accounts for 60-70% of daily calorie expenditure, with physical activity and food digestion making up the rest. For athletes, proper caloric intake supports muscle recovery, training adaptation, and performance optimization."
        };
      case "Protein":
        return {
          title: "Protein: The Science",
          description: "Proteins are chains of amino acids essential for muscle repair and growth. Scientific studies show that active individuals need 1.6-2.2g per kg of bodyweight for optimal recovery and adaptation. Protein has the highest thermic effect of food (TEF), meaning your body burns more calories digesting protein (20-30% of calories consumed) compared to carbs (5-10%) or fats (0-3%). Research indicates protein consumption helps preserve lean muscle mass during weight loss and improves satiety, reducing overall calorie intake."
        };
      case "Carbs":
        return {
          title: "Carbohydrates: The Science",
          description: "Carbohydrates are your body's preferred energy source, particularly for high-intensity exercise. Glucose derived from carbs is the primary fuel for your brain and central nervous system. Studies show that strategic carb intake around workouts improves performance by up to 2-3% and enhances recovery by replenishing muscle glycogen stores. For athletes, periodizing carbohydrate intake based on training demands (carb cycling) can optimize both performance and body composition goals simultaneously."
        };
      case "Fat":
        return {
          title: "Fat: The Science",
          description: "Dietary fats are crucial for hormone synthesis (including testosterone and estrogen), cell membrane integrity, and fat-soluble vitamin absorption (A, D, E, K). Research shows omega-3 fatty acids reduce inflammation and improve recovery, while monounsaturated fats support heart health. Fat provides 9 calories per gram (vs. 4 for protein/carbs), making it energy-dense but satiating. Studies indicate that athletes consuming adequate healthy fats maintain better hormonal profiles and performance compared to those on very low-fat diets."
        };
      default:
        return {
          title: label + ": The Science",
          description: "This nutrient plays a critical role in optimal physiological function. Scientific research demonstrates its importance for athletic performance, recovery, and overall health. Tracking this nutrient helps ensure you're meeting your body's specific requirements for optimal results."
        };
    }
  };

  const getValueInfo = () => {
    switch (label) {
      case "Calories":
        return {
          title: "Calorie Tracking",
          description: "The first number is your current calorie intake for the day. The second number is your daily calorie target based on your goals. The percentage shows your progress toward your daily target."
        };
      case "Protein":
        return {
          title: "Protein Tracking",
          description: "The first number shows how many grams of protein you've consumed today. The second number is your daily protein target. Adequate protein is essential for muscle recovery and maintenance."
        };
      case "Carbs":
        return {
          title: "Carbohydrate Tracking",
          description: "The first number shows your current carbohydrate intake in grams. The second number is your daily carbohydrate target. Carbs are your body's preferred energy source, especially for high-intensity activities."
        };
      case "Fat":
        return {
          title: "Fat Tracking",
          description: "The first number shows how many grams of fat you've consumed today. The second number is your daily fat target. Healthy fats are essential for hormone production and nutrient absorption."
        };
      default:
        return {
          title: "Nutrient Tracking",
          description: "The first number shows your current intake. The second number is your daily target. The percentage shows your progress toward your goal."
        };
    }
  };

  const nutrientInfo = getNutrientInfo();
  const valueInfo = getValueInfo();

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm text-muted-foreground cursor-pointer">
                {current.toFixed(1)} / {target.toFixed(1)}
                <span className="ml-2">{percentage}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-80 p-4">
              <div className="space-y-2">
                <h4 className="font-semibold">{valueInfo.title}</h4>
                <p className="text-sm">{valueInfo.description}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
