
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WeightChartProps {
  data: {
    weight: number;
    date: string;
  }[];
}

export const WeightChart = ({ data }: WeightChartProps) => {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("preferred_units")
        .eq("user_id", user.id)
        .maybeSingle();

      return data;
    },
  });

  const preferredUnits = profile?.preferred_units || 'metric';
  
  // Convert weight data based on preferred units
  const convertedData = data.map(entry => ({
    ...entry,
    weight: preferredUnits === 'imperial' 
      ? Math.round(entry.weight * 2.20462 * 10) / 10 // kg to lbs with 1 decimal
      : entry.weight
  }));

  const unitLabel = preferredUnits === 'imperial' ? 'lbs' : 'kg';

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Weight Progress</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={convertedData}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D946EF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
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
              tickFormatter={(value) => `${value}${unitLabel}`}
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
                            {payload[0].value}{unitLabel}
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
              stroke="#D946EF"
              fillOpacity={1}
              fill="url(#weightGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
