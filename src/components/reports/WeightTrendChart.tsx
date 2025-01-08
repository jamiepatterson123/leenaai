import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TimeRange } from "./TimeRangeSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WeightTrendChartProps {
  data: {
    weight: number;
    date: string;
  }[];
  timeRange: TimeRange;
}

export const WeightTrendChart = ({ data }: WeightTrendChartProps) => {
  // Fetch user's preferred units
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
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Weight Trend</h2>
        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger>
              <Info className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Track your weight changes over time to monitor progress toward your goals.</p>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={convertedData}>
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
              tickFormatter={(value) => `${value}${unitLabel}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div>
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Weight
                          </span>
                          <span className="ml-2 font-bold">
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
            <Line
              type="monotone"
              dataKey="weight"
              stroke="rgb(14, 165, 233)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};