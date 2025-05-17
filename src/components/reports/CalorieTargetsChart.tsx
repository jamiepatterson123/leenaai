
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CalorieTargetsChartProps {
  data: {
    calories: number;
  }[];
}

export const CalorieTargetsChart = ({ data }: CalorieTargetsChartProps) => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("target_calories")
        .eq("user_id", user.id)
        .single();

      return data;
    },
  });
  
  // Calculate average calories for the week
  const averageCalories = data.reduce((acc, day) => acc + day.calories, 0) / data.length;

  const chartData = [
    {
      name: "Calories",
      value: averageCalories,
      target: profile?.target_calories || 2000, // Use dynamic target with fallback
    }
  ];

  const getBarColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage > 110) return "#ef4444"; // red
    if (percentage >= 90 && percentage <= 110) return "#9b87f5"; // primary purple
    return "#f97316"; // orange
  };
  
  return (
    <Card className="p-4 sm:p-6 w-full">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Weekly Calorie Average vs Target</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
              <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <p>Compare your weekly calorie intake against your target. This helps ensure you're maintaining the right energy balance for your goals, whether that's weight loss, maintenance, or muscle gain.</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              className="stroke-muted"
            />
            <XAxis 
              type="category" 
              dataKey="name"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="number"
              tick={{ fontSize: 12 }}
              width={50}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <Legend 
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                paddingBottom: "20px",
                fontSize: "12px"
              }}
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
                    statusColor = "text-[#9b87f5]";
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
            <Bar
              dataKey="target"
              fill="#8E9196"
              name="Daily Target"
              barSize={40}
            />
            <Bar
              dataKey="value"
              name="Weekly Average"
              barSize={40}
              fill={getBarColor(averageCalories, profile?.target_calories || 2000)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
