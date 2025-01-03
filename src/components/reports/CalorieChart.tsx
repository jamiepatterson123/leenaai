import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalorieChartProps {
  data: {
    date: string;
    calories: number;
  }[];
}

export const CalorieChart = ({ data }: CalorieChartProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Calories Consumed</h2>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">View your daily calorie intake to understand your eating patterns. This helps you maintain consistency and identify days where you might need to adjust your intake.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Calories
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].value} kcal
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="calories"
              fill="url(#calorieGradient)"
              radius={[2, 2, 0, 0]}
              name="Consumed"
              style={{ pointerEvents: 'none' }}
              barSize={6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};