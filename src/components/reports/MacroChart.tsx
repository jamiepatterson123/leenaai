import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";

interface MacroChartProps {
  data: {
    date: string;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export const MacroChart = ({ data }: MacroChartProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Macronutrient Averages</h2>
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
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Protein
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].value.toFixed(1)}g
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Carbs
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[1].value.toFixed(1)}g
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Fat
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[2].value.toFixed(1)}g
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="protein"
              fill="rgb(14, 165, 233)"
              radius={[2, 2, 0, 0]}
              name="Protein"
              style={{ pointerEvents: 'none' }}
              barSize={6}
            />
            <Bar
              dataKey="carbs"
              fill="rgb(34, 197, 94)"
              radius={[2, 2, 0, 0]}
              name="Carbs"
              style={{ pointerEvents: 'none' }}
              barSize={6}
            />
            <Bar
              dataKey="fat"
              fill="rgb(249, 115, 22)"
              radius={[2, 2, 0, 0]}
              name="Fat"
              style={{ pointerEvents: 'none' }}
              barSize={6}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};