import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, eachDayOfInterval, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Medal, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const StreakCounter = () => {
  const [date, setDate] = useState<Date>(new Date());

  const { data: loggedDays } = useQuery({
    queryKey: ["logged-days", format(date, "yyyy-MM")],
    queryFn: async () => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const { data: entries } = await supabase
        .from("food_diary")
        .select("date")
        .gte("date", format(monthStart, "yyyy-MM-dd"))
        .lte("date", format(monthEnd, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (!entries?.length) return [];

      // Get unique dates (in case of multiple entries per day)
      return [...new Set(entries.map(entry => entry.date))];
    },
  });

  const { data: streak } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30); // Look back 30 days max

      const { data: entries } = await supabase
        .from("food_diary")
        .select("date")
        .gte("date", format(thirtyDaysAgo, "yyyy-MM-dd"))
        .lte("date", format(today, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (!entries?.length) return 0;

      // Get unique dates (in case of multiple entries per day)
      const uniqueDates = [...new Set(entries.map(entry => entry.date))];
      
      // Get all dates in the interval
      const allDates = eachDayOfInterval({ 
        start: thirtyDaysAgo,
        end: today 
      }).map(date => format(date, "yyyy-MM-dd"));

      // Calculate streak starting from today
      let currentStreak = 0;
      for (let i = 0; i < allDates.length; i++) {
        const date = allDates[allDates.length - 1 - i]; // Start from most recent
        if (uniqueDates.includes(date)) {
          currentStreak++;
        } else {
          break;
        }
      }

      return currentStreak;
    },
  });

  if (!streak) return null;

  return (
    <Card className="bg-secondary/30">
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Medal className="w-5 h-5 text-yellow-500" />
          <span className="text-lg font-medium">{streak} Day Streak!</span>
        </div>
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          className="rounded-md border"
          modifiers={{
            logged: (date) => loggedDays?.includes(format(date, "yyyy-MM-dd")) ?? false,
          }}
          modifiersClassNames={{
            logged: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
        />
      </CardContent>
    </Card>
  );
};