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
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WeightTrendChartProps {
  data: {
    weight: number | null;
    date: string;
  }[];
}

export const WeightTrendChart = ({ data }: WeightTrendChartProps) => {
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
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
  
  const convertedData = data.map(entry => ({
    ...entry,
    weight: entry.weight !== null 
      ? preferredUnits === 'imperial' 
        ? Math.round(entry.weight * 2.20462 * 10) / 10
        : entry.weight
      : null
  }));

  const unitLabel = preferredUnits === 'imperial' ? 'lbs' : 'kg';

  if (isLoadingProfile) {
    return (
      <Card className="p-6">
        <div className="h-[400px] w-full flex items-center justify-center">
          <div className="text-muted-foreground animate-pulse">
            Loading chart...
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Weight Trend</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
              <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <p>Track your weight changes over time to monitor progress toward your goals.</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={convertedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
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
              dy={10}
              tickFormatter={(value) => format(parseISO(value), "d. MMM")}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={50}
              tickFormatter={(value) => `${value}${unitLabel}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  if (value === null) return null;
                  
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div>
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Weight
                          </span>
                          <span className="ml-2 font-bold">
                            {value}{unitLabel}
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
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};