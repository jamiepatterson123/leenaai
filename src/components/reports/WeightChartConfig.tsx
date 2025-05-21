
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { format, isValid } from "date-fns";
import { WeightTooltipContent } from "./WeightTooltipContent";

export interface WeightChartData {
  date: string;
  weight: number;
  id?: string;
}

interface WeightChartConfigProps {
  data: WeightChartData[];
  onDelete: (date: string, weight: number, id?: string) => void;
  onEdit: (date: string, weight: number, id?: string) => void;
  preferredUnits: string;
  isMobile: boolean;
}

export const WeightChartConfig: React.FC<WeightChartConfigProps> = ({
  data,
  onDelete,
  onEdit,
  preferredUnits,
  isMobile
}) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  // Format date for display
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    if (!isValid(date)) return "";
    return format(date, "MMM d");
  };

  const tooltipFormatter = (value: number) => {
    return [
      `${value} ${preferredUnits === 'metric' ? 'kg' : 'lbs'}`,
      "Weight"
    ];
  };

  const handleClick = (data: any, index: number) => {
    setActivePoint(activePoint === index ? null : index);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        onClick={handleClick}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis
          tickFormatter={(value) =>
            `${value} ${preferredUnits === 'metric' ? 'kg' : 'lbs'}`
          }
          tick={{ fontSize: 12 }}
          domain={["dataMin - 2", "dataMax + 2"]}
        />
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={(value) => {
            const date = new Date(value);
            if (!isValid(date)) return "";
            return format(date, "MMM d, yyyy");
          }}
          content={
            ({active, payload}) => (
              <WeightTooltipContent
                active={active}
                payload={payload}
                onDelete={onDelete}
                onEdit={onEdit}
                preferredUnits={preferredUnits}
                isMobile={isMobile}
              />
            )
          }
          trigger="click"
          wrapperStyle={{ 
            outline: 'none', 
            zIndex: 1000,
            pointerEvents: 'auto' 
          }}
          allowEscapeViewBox={{ x: true, y: true }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{
            r: 4,
            strokeWidth: 1,
            fill: "white",
            stroke: "#8884d8"
          }}
          activeDot={{
            r: 6,
            stroke: "#8884d8",
            strokeWidth: 1,
            fill: "#8884d8"
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
