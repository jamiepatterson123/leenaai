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
  
  const averageCalories = data.reduce((acc, day) => acc + day.calories, 0) / data.length;

  const chartData = [
    {
      name: "Calories",
      value: averageCalories,
      target: targets.calories,
    }
  ];

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
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
          >
            <defs>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="averageGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
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
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">Weekly Average</p>
                        <p>Average: {data.value.toFixed(0)} kcal</p>
                        <p>Target: {data.target} kcal</p>
                        <p className="text-[#0891b2]">
                          {percentage.toFixed(0)}% of target
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
              fill="url(#targetGradient)"
              name="Daily Target"
              barSize={20}
            />
            <Bar
              dataKey="value"
              name="Weekly Average"
              barSize={20}
              fill="url(#averageGradient)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};