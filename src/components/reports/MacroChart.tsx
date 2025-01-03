import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Macronutrient Averages</h2>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Track your daily intake of protein, carbs, and fat. This helps ensure you're getting a balanced diet that supports your fitness goals, energy levels, and overall health.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="carbsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <linearGradient id="fatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
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
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingBottom: "20px"
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#0891b2]" />
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Protein
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {typeof payload[0].value === 'number' 
                              ? payload[0].value.toFixed(1) 
                              : '0'}g
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Carbohydrates
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {typeof payload[1].value === 'number' 
                              ? payload[1].value.toFixed(1) 
                              : '0'}g
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#0891b2]" />
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Fat
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {typeof payload[2].value === 'number' 
                              ? payload[2].value.toFixed(1) 
                              : '0'}g
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
              fill="url(#proteinGradient)"
              radius={[2, 2, 0, 0]}
              name="Protein"
              style={{ pointerEvents: 'none' }}
              barSize={6}
            />
            <Bar
              dataKey="carbs"
              fill="url(#carbsGradient)"
              radius={[2, 2, 0, 0]}
              name="Carbohydrates"
              style={{ pointerEvents: 'none' }}
              barSize={6}
            />
            <Bar
              dataKey="fat"
              fill="url(#fatGradient)"
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