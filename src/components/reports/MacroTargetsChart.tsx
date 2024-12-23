import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";

interface MacroTargetsChartProps {
  data: {
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export const MacroTargetsChart = ({ data }: MacroTargetsChartProps) => {
  const { targets } = useNutritionTargets();
  
  // Calculate averages for the week
  const averages = data.reduce((acc, day) => ({
    protein: acc.protein + day.protein,
    carbs: acc.carbs + day.carbs,
    fat: acc.fat + day.fat,
  }), { protein: 0, carbs: 0, fat: 0 });

  const weeklyData = [
    {
      name: "Protein",
      value: averages.protein / data.length,
      target: targets.protein,
      color: "rgb(14, 165, 233)",
    },
    {
      name: "Carbohydrates",
      value: averages.carbs / data.length,
      target: targets.carbs,
      color: "rgb(34, 197, 94)",
    },
    {
      name: "Fat",
      value: averages.fat / data.length,
      target: targets.fat,
      color: "rgb(249, 115, 22)",
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Weekly Macro Averages vs Targets</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={weeklyData}
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
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <p className="font-medium">{data.name}</p>
                        <p>Average: {data.value.toFixed(1)}g</p>
                        <p>Target: {data.target}g</p>
                        <p>{percentage.toFixed(0)}% of target</p>
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
              name="Target"
              barSize={20}
            />
            <Bar
              dataKey="value"
              name="Average"
              barSize={20}
            >
              {weeklyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};