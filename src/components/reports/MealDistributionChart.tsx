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
  const colors = ["#ea384c", "#06b6d4", "#FFD700", "#22c55e"];

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
    <Card className="p-4 sm:p-6 w-full bg-white">
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
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
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