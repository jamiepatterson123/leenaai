import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalorieTargetsChartProps {
  data: {
    calories: number;
  }[];
}

export const CalorieTargetsChart = ({ data }: CalorieTargetsChartProps) => {
  const { targets } = useNutritionTargets();
  
  // Calculate average calories for the week
  const averageCalories = data.reduce((acc, day) => acc + day.calories, 0) / data.length;

  const chartData = [
    {
      name: "Calories",
      value: averageCalories,
      target: targets.calories,
      color: "#9b87f5",
    }
  ];

  const getBarColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage > 110) return "#ef4444"; // red
    if (percentage >= 90 && percentage <= 110) return "#9b87f5"; // primary purple
    return "#f97316"; // orange
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Weekly Calorie Average vs Target</h2>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Compare your weekly calorie intake against your target. This helps ensure you're maintaining the right energy balance for your goals, whether that's weight loss, maintenance, or muscle gain.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage = (data.value / data.target) * 100;
                  let status = "";
                  let statusColor = "";

                  if (percentage > 110) {
                    status = "Over target";
                    statusColor = "text-red-500";
                  } else if (percentage >= 90 && percentage <= 110) {
                    status = "Within target ✓";
                    statusColor = "text-[#9b87f5]";
                  } else {
                    status = "Under target";
                    statusColor = "text-orange-500";
                  }

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">Weekly Average</p>
                        <p>Average: {data.value.toFixed(0)} kcal</p>
                        <p>Target: {data.target} kcal</p>
                        <p className={statusColor}>
                          {percentage.toFixed(0)}% of target - {status}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              dataKey="target"
              fill="#8E9196"
              name="Daily Target"
              barSize={20}
            />
            <Bar
              dataKey="value"
              name="Weekly Average"
              barSize={20}
              fill={getBarColor(averageCalories, targets.calories)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};