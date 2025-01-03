import React from "react";
import {
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface IndividualMacroChartProps {
  data: {
    date: string;
    value: number;
    average: number;
  }[];
  title: string;
  color: string;
  unit: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: string;
      value: number;
      average: number;
    };
  }>;
}

export const IndividualMacroChart = ({ 
  data, 
  title, 
  color,
  unit 
}: IndividualMacroChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs font-medium"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="text-xs font-medium"
              tick={{ fill: 'currentColor' }}
              label={{ 
                value: unit, 
                angle: -90, 
                position: 'insideLeft',
                fill: 'currentColor'
              }}
            />
            <Tooltip
              content={({ active, payload }: CustomTooltipProps) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">{payload[0].payload.date}</p>
                        <p>Daily: {payload[0].value.toFixed(1)}{unit}</p>
                        <p>Average: {payload[1].value.toFixed(1)}{unit}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              dataKey="value"
              fill={color}
              name="Daily Intake"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#94a3b8"
              name="Rolling Average"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};