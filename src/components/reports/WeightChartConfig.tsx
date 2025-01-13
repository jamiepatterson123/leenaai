import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { WeightTooltipContent } from './WeightTooltipContent';

interface WeightChartConfigProps {
  data: Array<{
    weight: number;
    date: string;
  }>;
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
  const [activePoint, setActivePoint] = React.useState<number | null>(null);

  const handleClick = (event: any) => {
    if (isMobile) {
      const index = data.findIndex(
        item => item.date === event.payload.date
      );
      setActivePoint(activePoint === index ? null : index);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActivePoint(null);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        onMouseLeave={handleMouseLeave}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => new Date(date).toLocaleDateString()}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          unit={preferredUnits === 'metric' ? ' kg' : ' lbs'}
        />
        <Tooltip
          content={(props: TooltipProps<number, string>) => {
            if (!props.payload?.length) return null;
            
            const transformedPayload = props.payload.map(entry => ({
              value: entry.value as number,
              payload: {
                weight: entry.payload.weight,
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
          isAnimationActive={false}
          position={{ y: 0 }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#16a34a"
          strokeWidth={1.5}
          dot={{ r: 3, strokeWidth: 1 }}
          activeDot={{
            r: 4,
            onClick: handleClick,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};