import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";

interface MealDistributionChartProps {
  data: Array<{
    category?: string;
    calories: number;
  }>;
}

export const MealDistributionChart = ({ data }: MealDistributionChartProps) => {
  const categories = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  const colors = ["#0ea5e9", "#22c55e", "#f97316", "#8b5cf6"];

  const categoryTotals = categories.map(category => ({
    name: category,
    value: data
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.calories, 0)
  }));

  const total = categoryTotals.reduce((sum, item) => sum + item.value, 0);
  const chartData = categoryTotals.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
  }));

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Meal Distribution</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">{data.name}</p>
                        <p>{data.value.toFixed(0)} calories</p>
                        <p>{data.percentage}% of total</p>
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