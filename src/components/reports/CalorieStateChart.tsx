
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const states = ["liquid", "solid"];
  const colors = ["#D946EF", "#8B5CF6"]; // Updated to pink/purple gradient colors

  const processedData = states.map((state) => {
    const totalCalories = data
      .filter((entry) => entry.state?.toLowerCase() === state)
      .reduce((sum, entry) => sum + entry.calories, 0);

    return {
      name: state.charAt(0).toUpperCase() + state.slice(1),
      value: totalCalories || 0,
    };
  });

  const totalCalories = processedData.reduce((sum, entry) => sum + entry.value, 0);
  const minValue = 50;
  const chartData = processedData.map(entry => ({
    ...entry,
    value: totalCalories === 0 ? minValue : (entry.value || minValue/2)
  }));

  return (
    <Card className="p-4 sm:p-6 w-full bg-white">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Calories by State</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
              <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <p>Track the distribution of your calories between solid and liquid foods. This can help you understand how much of your caloric intake comes from drinks versus solid meals.</p>
          </DialogContent>
        </Dialog>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
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
    </Card>
  );
};
