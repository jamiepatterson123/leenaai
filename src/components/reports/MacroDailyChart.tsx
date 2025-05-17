
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { format, parseISO } from "date-fns";

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
        return "#ea384c";
      case "carbs":
        return "#FFD700"; // Bold, strong yellow (Golden Yellow)
      case "fat":
        return "#06b6d4"; // Updated to Ocean Blue to match food diary
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
    date: entry.date,
    value: entry[type],
  }));

  // Calculate the average
  const average = chartData.reduce((sum, entry) => sum + entry.value, 0) / chartData.length;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">{getTitle()}</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
              <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <p>{getTooltipContent()}</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              className="stroke-muted"
            />
            <XAxis 
              dataKey="date" 
              className="text-xs font-medium"
              tickMargin={8}
              hide={false}
              tickLine={false}
              axisLine={false}
              dy={10}
              tickFormatter={(value) => format(parseISO(value), "d. MMM")}
            />
            <YAxis 
              className="text-xs font-medium"
              tickMargin={8}
              width={50}
              tickLine={false}
              axisLine={false}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border/50 rounded-lg p-2 text-sm">
                      <p className="font-medium">{format(parseISO(data.date), "d. MMM")}</p>
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
