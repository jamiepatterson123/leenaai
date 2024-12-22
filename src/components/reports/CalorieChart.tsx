import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

interface CalorieChartProps {
  data: {
    date: string;
    calories: number;
  }[];
}

export const CalorieChart = ({ data }: CalorieChartProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Calories Consumed</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Calories
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].value} kcal
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="calories"
              fill="rgb(14, 165, 233)"
              radius={[2, 2, 0, 0]}
              name="Consumed"
              style={{ pointerEvents: 'none' }}
              barSize={6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};