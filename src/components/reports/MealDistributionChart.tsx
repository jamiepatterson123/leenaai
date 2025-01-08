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

interface MealDistributionChartProps {
  data: {
    calories: number;
    category: string;
  }[];
}

export const MealDistributionChart = ({ data }: MealDistributionChartProps) => {
  const mealCategories = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  const colors = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6"];

  const processedData = mealCategories.map((category) => {
    const totalCalories = data
      .filter((entry) => entry.category?.toLowerCase() === category.toLowerCase())
      .reduce((sum, entry) => sum + entry.calories, 0);

    return {
      name: category,
      value: totalCalories || 0,
    };
  });

  const totalCalories = processedData.reduce((sum, entry) => sum + entry.value, 0);
  const minValue = 50;
  const chartData = processedData.map(entry => ({
    ...entry,
    value: totalCalories === 0 ? minValue : (entry.value || minValue/4)
  }));

  return (
    <Card className="p-4 sm:p-6 w-full">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Calories by Meal</h2>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">See how your calories are distributed across different meals. This helps you understand your eating patterns and make adjustments to better align with your nutritional goals and daily routine.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="w-full aspect-square max-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({
                cx,
                cy,
                midAngle,
                innerRadius,
                outerRadius,
                name,
                value,
              }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius * 1.35;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                
                const actualValue = processedData.find(d => d.name === name)?.value || 0;
                const percentage = totalCalories ? ((actualValue / totalCalories) * 100).toFixed(0) : "0";

                const textAnchor = x > cx ? "start" : "end";
                const labelX = x > cx ? x + 5 : x - 5;

                return (
                  <g>
                    <text
                      x={labelX}
                      y={y}
                      fill="currentColor"
                      textAnchor={textAnchor}
                      dominantBaseline="central"
                      className="text-[10px] sm:text-sm font-medium"
                      style={{
                        filter: "drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.9))"
                      }}
                    >
                      {`${name} (${percentage}%)`}
                    </text>
                  </g>
                );
              }}
              outerRadius={100}
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
                  const actualValue = processedData.find(d => d.name === data.name)?.value || 0;
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
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "20px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};