
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface WaterConsumptionChartProps {
  data: {
    timestamp: string;
    amount_ml: number;
  }[];
}

export const WaterConsumptionChart = ({ data }: WaterConsumptionChartProps) => {
  const chartConfig = {
    water: {
      label: "Water Consumption",
      theme: {
        light: "#D946EF", // Vibrant pink
        dark: "#8B5CF6", // Vibrant purple
      },
    },
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4">
        <h3 className="font-semibold">Water Consumption</h3>
        <p className="text-sm text-muted-foreground">Daily water intake in ml</p>
      </div>
      <div className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                className="text-sm text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-sm text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}ml`}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="amount_ml"
                name="water"
                stroke="var(--color-water)"
                fill="var(--color-water)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};
