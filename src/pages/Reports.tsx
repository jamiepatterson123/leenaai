import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

interface WeightData {
  weight_kg: number;
  updated_at: string;
}

const Reports = () => {
  const { data: weightData, isLoading } = useQuery({
    queryKey: ["weightHistory"],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("weight_kg, updated_at")
        .order("updated_at", { ascending: true });

      if (error) throw error;

      return profile.map((entry: WeightData) => ({
        weight: entry.weight_kg,
        date: format(new Date(entry.updated_at), "MMM d"),
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Reports</h1>
      
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Weight Progress</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}kg`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Weight
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}kg
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="rgb(14, 165, 233)"
                fillOpacity={1}
                fill="url(#weightGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Reports;