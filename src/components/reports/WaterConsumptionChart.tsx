
import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, parseISO } from "date-fns";

interface WaterConsumptionChartProps {
  data: {
    timestamp: string;
    amount_ml: number;
  }[];
}

export const WaterConsumptionChart = ({
  data
}: WaterConsumptionChartProps) => {
  const chartConfig = {
    water: {
      label: "Water Consumption",
      theme: {
        light: "#D946EF", // Vibrant pink
        dark: "#8B5CF6"  // Vibrant purple
      }
    }
  };

  return (
    <Card className="bg-white overflow-hidden">
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-semibold">Water Consumption</h2>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Track your daily water intake. Staying properly hydrated is essential for optimal performance, recovery, and overall health.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 5, left: 5, bottom: 20 }}
          >
            <defs>
              <linearGradient id="waterColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.water.theme.light} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartConfig.water.theme.light} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
              tickFormatter={(value) => format(parseISO(value), "MMM d")}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={50}
              tickFormatter={(value) => `${value} ml`}
            />
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">{format(parseISO(data.timestamp), "MMMM d, yyyy")}</p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#D946EF] to-[#8B5CF6]" />
                          <span className="text-[0.70rem] uppercase text-muted-foreground">Water</span>
                          <span className="font-bold text-muted-foreground">{data.amount_ml} ml</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount_ml"
              stroke={chartConfig.water.theme.light}
              fillOpacity={1}
              fill="url(#waterColor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
