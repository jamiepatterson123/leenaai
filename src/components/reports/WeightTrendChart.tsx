import {
  Line,
  LineChart,
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

interface WeightTrendChartProps {
  data: {
    weight: number;
    date: string;
  }[];
}

export const WeightTrendChart = ({ data }: WeightTrendChartProps) => {
  const movingAverageData = data.map((entry, index) => {
    const start = Math.max(0, index - 6);
    const values = data.slice(start, index + 1).map(d => d.weight);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    return {
      ...entry,
      movingAverage: Number(average.toFixed(1))
    };
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Weight Trend with 7-Day Average</h2>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Track your weight changes over time with a 7-day moving average to smooth out daily fluctuations. This helps you identify true weight trends and monitor progress toward your goals more accurately.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={movingAverageData}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity={0} />
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
              tickFormatter={(value) => `${value}kg`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div>
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Weight
                          </span>
                          <span className="ml-2 font-bold">
                            {payload[0].value}kg
                          </span>
                        </div>
                        <div>
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            7-Day Average
                          </span>
                          <span className="ml-2 font-bold">
                            {payload[1].value}kg
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="rgb(14, 165, 233)"
              strokeWidth={2}
              dot={true}
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke="rgb(34, 197, 94)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
