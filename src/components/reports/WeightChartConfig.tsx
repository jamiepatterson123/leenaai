import { format, parseISO } from "date-fns";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WeightTooltipContent } from "./WeightTooltipContent";

interface WeightChartConfigProps {
  data: {
    weight: number | null;
    date: string;
  }[];
  unitLabel: string;
  isMobile: boolean;
  onDelete: (date: string) => void;
}

export const WeightChartConfig = ({
  data,
  unitLabel,
  isMobile,
  onDelete,
}: WeightChartConfigProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart 
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
          tickFormatter={(value) => format(parseISO(value), "d. MMM")}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={50}
          tickFormatter={(value) => `${value}${unitLabel}`}
        />
        <Tooltip
          trigger={isMobile ? 'click' : 'hover'}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const value = payload[0].value;
              const date = payload[0].payload.date;
              if (value === null) return null;
              
              return (
                <WeightTooltipContent
                  value={value}
                  date={date}
                  unitLabel={unitLabel}
                  onDelete={onDelete}
                />
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="rgb(14, 165, 233)"
          strokeWidth={2}
          dot={true}
          connectNulls={true}
          activeDot={{ r: isMobile ? 8 : 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};