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
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";

interface CalorieTargetsChartProps {
  data: {
    calories: number;
  }[];
}

export const CalorieTargetsChart = ({ data }: CalorieTargetsChartProps) => {
  const targets = useNutritionTargets();
  
  // Calculate average calories for the week
  const averageCalories = data.reduce((acc, day) => acc + day.calories, 0) / data.length;

  const chartData = [
    {
      name: "Calories",
      value: averageCalories,
      target: targets.calories,
      color: "rgb(14, 165, 233)",
    }
  ];

  const getBarColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage > 110) return "#ef4444"; // red
    if (percentage >= 90 && percentage <= 110) return "#22c55e"; // green
    return "#f97316"; // orange
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Weekly Calorie Average vs Target</h2>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage = (data.value / data.target) * 100;
                  let status = "";
                  let statusColor = "";

                  if (percentage > 110) {
                    status = "Over target";
                    statusColor = "text-red-500";
                  } else if (percentage >= 90 && percentage <= 110) {
                    status = "Within target ✓";
                    statusColor = "text-green-600";
                  } else {
                    status = "Under target";
                    statusColor = "text-orange-500";
                  }

                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">Weekly Average</p>
                        <p>Average: {data.value.toFixed(0)} kcal</p>
                        <p>Target: {data.target} kcal</p>
                        <p className={statusColor}>
                          {percentage.toFixed(0)}% of target - {status}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              dataKey="target"
              fill="#94a3b8"
              name="Daily Target"
              barSize={20}
            />
            <Bar
              dataKey="value"
              name="Weekly Average"
              barSize={20}
              fill={getBarColor(averageCalories, targets.calories)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};