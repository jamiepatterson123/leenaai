
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
    id?: string;  // Add optional ID field
  }>;
  preferredUnits: string;
  isMobile: boolean;
  onDelete: (date: string, weight: number, id?: string) => void;
  onEdit: (date: string, weight: number, id?: string) => void;
}

export const WeightChartConfig: React.FC<WeightChartConfigProps> = ({
  data,
  preferredUnits,
  isMobile,
  onDelete,
  onEdit,
}) => {
  const [activePoint, setActivePoint] = React.useState<number | null>(null);

  const handleClick = (event: any) => {
    if (!event.activePayload?.[0]?.payload) return;
    
    const index = data.findIndex(
      (item) => item.date === event.activePayload[0].payload.date
    );
    
    setActivePoint(activePoint === index ? null : index);
  };

  const handleMouseLeave = () => {
    // Don't reset on mouse leave, let users explicitly close by clicking elsewhere
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => {
            const d = new Date(date);
            return `${d.getDate()}. ${d.toLocaleString('default', { month: 'short' })}`;
          }}
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
          unit={preferredUnits === 'metric' ? 'kg' : ' lbs'}
          domain={['dataMin - 10', 'dataMax + 10']}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip
          content={(props: TooltipProps<number, string>) => (
            <WeightTooltipContent
              {...props}
              onDelete={onDelete}
              onEdit={onEdit}
              preferredUnits={preferredUnits}
              isMobile={isMobile}
            />
          )}
          trigger="click"
          wrapperStyle={{ outline: 'none', zIndex: 1000 }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#D946EF" 
          strokeWidth={1.5}
          dot={{ r: 3, strokeWidth: 1, fill: "#fff" }}
          activeDot={{
            r: 5,
            stroke: "#D946EF",
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
