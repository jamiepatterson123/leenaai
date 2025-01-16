import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
  ResponsiveContainer,
} from "recharts";
import { WeightTooltipContent } from "./WeightTooltipContent";

interface WeightChartConfigProps {
  data: {
    weight: number;
    date: string;
  }[];
  preferredUnits: string;
  isMobile: boolean;
  onDelete: (date: string) => void;
}

export const WeightChartConfig = ({
  data,
  preferredUnits,
  isMobile,
  onDelete,
}: WeightChartConfigProps) => {
  const [activePoint, setActivePoint] = React.useState<number | null>(null);

  const handleClick = (event: any) => {
    if (!event.activePayload?.[0]?.payload) return;
    
    const index = data.findIndex(
      (item) => item.date === event.activePayload[0].payload.date
    );
    setActivePoint(index);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActivePoint(null);
    }
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          onClick={handleClick}
          onMouseLeave={handleMouseLeave}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="date"
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
            domain={['dataMin - 2', 'dataMax + 2']}
          />
          <Tooltip
            content={(props: TooltipProps<number, string>) => (
              <WeightTooltipContent
                {...props}
                unit={preferredUnits === 'metric' ? 'kg' : 'lbs'}
                onDelete={onDelete}
                isMobile={isMobile}
              />
            )}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
            activeDot={{
              r: 6,
              onClick: handleClick,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};