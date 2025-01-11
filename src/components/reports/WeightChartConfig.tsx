import { format } from "date-fns";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WeightTooltipContent } from "./WeightTooltipContent";

interface WeightChartConfigProps {
  data: Array<{
    date: string;
    weight: number;
  }>;
  onDeleteWeight: (date: string) => void;
  preferredUnits: string;
}

export const WeightChartConfig = ({ 
  data, 
  onDeleteWeight,
  preferredUnits 
}: WeightChartConfigProps) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#9b87f5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={(date) => format(new Date(date), "MMM d")}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => {
            return preferredUnits === 'imperial' 
              ? `${(value * 2.20462).toFixed(1)} lbs`
              : `${value.toFixed(1)} kg`;
          }}
        />
        <Tooltip
          content={({ active, payload }) => (
            <WeightTooltipContent
              active={active}
              payload={payload}
              onDelete={onDeleteWeight}
              preferredUnits={preferredUnits}
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#9b87f5"
          fillOpacity={1}
          fill="url(#weightGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};