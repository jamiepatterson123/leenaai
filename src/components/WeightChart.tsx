import React from "react";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const WeightChart = () => {
  const { data: weightData } = useQuery({
    queryKey: ["weightHistory"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("weight_kg, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: true });

      if (error) throw error;

      return data.map(entry => ({
        weight: entry.weight_kg,
        date: format(new Date(entry.updated_at), "MMM d"),
      }));
    },
  });

  if (!weightData?.length) {
    return null;
  }

  return (
    <Card className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 space-y-6">
        <h3 className="text-2xl font-semibold text-gray-900">Weight Tracker</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#374151"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#374151"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dx={-10}
                unit=" kg"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-white p-3 shadow-md">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="font-medium text-gray-900">Weight:</span>
                        <span className="text-primary">{payload[0].value} kg</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#weightGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};