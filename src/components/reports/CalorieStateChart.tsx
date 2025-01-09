import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CalorieStateChartProps {
  data: {
    calories: number;
    state: string;
  }[];
}

export const CalorieStateChart = ({ data }: CalorieStateChartProps) => {
  // Calculate total calories for each state
  const liquidCalories = data
    .filter(entry => entry.state?.toLowerCase() === 'liquid')
    .reduce((sum, entry) => sum + entry.calories, 0);

  const solidCalories = data
    .filter(entry => entry.state?.toLowerCase() === 'solid')
    .reduce((sum, entry) => sum + entry.calories, 0);

  const chartData = [
    { name: "Liquid", value: liquidCalories || 50 },
    { name: "Solid", value: solidCalories || 50 },
  ];

  const colors = ["#3b82f6", "#22c55e"];
  const totalCalories = Math.max(liquidCalories + solidCalories, 100);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Calories by State</h2>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Understand the balance between solid and liquid calories in your diet. This can help you make informed decisions about your food choices and ensure you're not consuming too many calories through drinks.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                name,
                value
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius * 1.4;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                
                const actualValue = name === "Liquid" ? liquidCalories : solidCalories;
                const percent = totalCalories ? ((actualValue / totalCalories) * 100).toFixed(0) : "0";

                return (
                  <text
                    x={x}
                    y={y}
                    fill="currentColor"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    className="text-sm"
                  >
                    {`${name} (${percent}%)`}
                  </text>
                );
              }}
              outerRadius={80}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const actualValue = data.name === "Liquid" ? liquidCalories : solidCalories;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">{data.name}</p>
                        <p>{actualValue.toFixed(0)} kcal</p>
                        {totalCalories > 0 && (
                          <p>{((actualValue / totalCalories) * 100).toFixed(0)}% of total</p>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
