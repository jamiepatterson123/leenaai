import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface MacroDailyChartProps {
  data: {
    date: string;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  type: "protein" | "carbs" | "fat";
}

export const MacroDailyChart = ({ data, type }: MacroDailyChartProps) => {
  const getTitle = () => {
    switch (type) {
      case "protein":
        return "Daily Protein Intake (g)";
      case "carbs":
        return "Daily Carbohydrate Intake (g)";
      case "fat":
        return "Daily Fat Intake (g)";
    }
  };

  const getColor = () => {
    switch (type) {
      case "protein":
        return "#9b87f5"; // Primary purple
      case "carbs":
        return "#7E69AB"; // Secondary purple
      case "fat":
        return "#8E9196"; // Neutral gray
    }
  };

  const getTooltipContent = () => {
    switch (type) {
      case "protein":
        return "Track your daily protein intake to ensure muscle maintenance and growth. Protein is essential for recovery after workouts and maintaining lean body mass.";
      case "carbs":
        return "Monitor your carbohydrate consumption to optimize energy levels throughout the day. Carbs are your body's primary energy source for both physical and mental activities.";
      case "fat":
        return "Keep an eye on your fat intake for hormone regulation and nutrient absorption. Healthy fats are crucial for brain function and overall health.";
    }
  };

  const chartData = data.map((entry) => ({
    name: entry.date,
    value: entry[type],
  }));

  // Calculate the average
  const average = chartData.reduce((sum, entry) => sum + entry.value, 0) / chartData.length;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">{getTitle()}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{getTooltipContent()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="w-full h-[300px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              className="text-xs font-medium"
            />
            <YAxis 
              className="text-xs font-medium"
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border/50 rounded-lg p-2 text-sm">
                      <p className="font-medium">{data.name}</p>
                      <p>Amount: {Math.round(data.value)}g</p>
                      <p className="text-muted-foreground">Average: {Math.round(average)}g</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={average}
              stroke={getColor()}
              strokeDasharray="3 3"
              label={{
                value: `Avg: ${Math.round(average)}g`,
                fill: getColor(),
                fontSize: 12,
                position: 'right',
              }}
            />
            <Bar
              dataKey="value"
              fill={getColor()}
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};