import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Background,
} from "recharts";

interface NutritionChartProps {
  data: {
    name: string;
    value: number;
    target: number;
    color: string;
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
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border border-border/50 rounded-lg p-2 text-sm">
                    <p className="font-medium">{data.name}</p>
                    <p>Current: {data.value}</p>
                    <p>Target: {data.target}</p>
                    <p>Progress: {Math.round((data.value / data.target) * 100)}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="target"
            fill="#F1F1F1"
            radius={[0, 4, 4, 0]}
            barSize={30}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            barSize={30}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};