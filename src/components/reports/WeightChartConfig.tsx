import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip
          content={({ payload }) => (
            <WeightTooltipContent
              payload={payload}
              onDelete={onDelete}
              preferredUnits={preferredUnits}
              isMobile={isMobile}
            />
          )}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};