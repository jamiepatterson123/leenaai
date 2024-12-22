import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface NutritionChartProps {
  data: {
    name: string;
    value: number;
    fill: string;
  }[];
}

export const NutritionBarChart: React.FC<NutritionChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[300px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
          <XAxis type="number" className="text-xs font-medium" />
          <YAxis
            type="category"
            dataKey="name"
            className="text-xs font-medium"
            width={75}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Bar
            dataKey="value"
            fill="currentColor"
            radius={[0, 4, 4, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};