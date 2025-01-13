import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { WeightTooltipContent } from './WeightTooltipContent';

export interface WeightChartConfigProps {
  data: Array<{ weight: number; date: string }>;
  preferredUnits: string;
  isMobile: boolean;
  onDelete: (date: string) => void;
}

export const WeightChartConfig: React.FC<WeightChartConfigProps> = ({
  data,
  preferredUnits,
  isMobile,
  onDelete,
}) => {
  const formatYAxis = (value: number) => {
    return `${value}${preferredUnits === 'metric' ? 'kg' : 'lbs'}`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false}
          stroke="#E5E7EB"
          opacity={0.5}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
          axisLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={false}
          dy={10}
        />
        <YAxis 
          tickFormatter={formatYAxis}
          axisLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickLine={false}
          dx={-10}
        />
        <Tooltip
          content={(props: TooltipProps<number, string>) => {
            if (!props.payload?.length) return null;
            
            const transformedPayload = props.payload.map(entry => ({
              value: entry.value as number,
              payload: {
                weight: entry.value as number,
                date: entry.payload.date
              }
            }));

            return (
              <WeightTooltipContent
                payload={transformedPayload}
                onDelete={onDelete}
                preferredUnits={preferredUnits}
                isMobile={isMobile}
              />
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4, fill: 'white' }}
          activeDot={{ r: 6, fill: '#3B82F6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};