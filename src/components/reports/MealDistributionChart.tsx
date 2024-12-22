import { Card } from "@/components/ui/card";
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
      value: totalCalories || 0, // Ensure we always have at least 0
    };
  });

  // Calculate total calories for percentage
  const totalCalories = processedData.reduce((sum, entry) => sum + entry.value, 0);

  // Ensure we always have a minimum size for the chart to prevent label overlap
  const minValue = 50; // Minimum value to ensure spacing
  const chartData = processedData.map(entry => ({
    ...entry,
    // If all values are 0, give each category an equal minimum value
    value: totalCalories === 0 ? minValue : (entry.value || minValue/4)
  }));

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Calories by Meal</h2>
      <div className="h-[300px] w-full">
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
                
                const actualValue = processedData.find(d => d.name === name)?.value || 0;
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
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};