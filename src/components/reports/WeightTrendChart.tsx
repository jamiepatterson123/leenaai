import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Info, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface WeightTrendChartProps {
  data: {
    weight: number | null;
    date: string;
  }[];
}

export const WeightTrendChart = ({ data }: WeightTrendChartProps) => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("preferred_units")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (date: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to delete weight entries");
        return;
      }

      const { error } = await supabase
        .from("weight_history")
        .delete()
        .eq("user_id", user.id)
        .eq("recorded_at", date);

      if (error) throw error;

      toast.success("Weight entry deleted");
      queryClient.invalidateQueries({ queryKey: ["weightHistory"] });
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      toast.error("Failed to delete weight entry");
    }
  };

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

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Weight Trend</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 p-0"
            >
              <Info className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <p>Track your weight changes over time to monitor progress toward your goals.</p>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
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
                trigger={isMobile ? 'click' : 'hover'}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value;
                    const date = payload[0].payload.date;
                    if (value === null) return null;
                    
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Weight
                            </span>
                            <span className="font-bold">
                              {value}{unitLabel}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive/90"
                              onClick={() => handleDelete(date)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                activeDot={{ r: isMobile ? 8 : 6 }} // Larger dot on mobile for better touch targets
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};