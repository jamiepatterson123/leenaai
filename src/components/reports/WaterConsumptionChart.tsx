import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
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
        light: "#D946EF",
        // Vibrant pink
        dark: "#8B5CF6" // Vibrant purple
      }
    }
  };
  return;
};