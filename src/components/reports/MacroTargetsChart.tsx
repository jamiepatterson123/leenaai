
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MacroTargetsChartProps {
  data: {
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

export const MacroTargetsChart = ({ data }: MacroTargetsChartProps) => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("target_protein, target_carbs, target_fat")
        .eq("user_id", user.id)
        .single();

      return data;
    },
  });
  
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
      target: profile?.target_protein || 150,
      color: "#ea384c",
    },
    {
      name: "Carbs",
      value: averages.carbs / data.length,
      target: profile?.target_carbs || 200,
      color: "#FFD700",
    },
    {
      name: "Fat",
      value: averages.fat / data.length,
      target: profile?.target_fat || 70,
      color: "#06b6d4",
    },
  ];

  return (
    <Card className="p-4 sm:p-6 w-full">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Weekly Macro Averages vs Targets</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
              <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <p>Compare your weekly macronutrient intake against your targets. This helps ensure you're maintaining the right balance for your goals.</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
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
            <Bar
              dataKey="target"
              fill="#8E9196"
              name="Target"
              barSize={40}
            />
            <Bar
              dataKey="value"
              name="Average"
              barSize={40}
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
