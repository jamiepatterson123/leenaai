import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, eachDayOfInterval, subDays } from "date-fns";
import { Medal } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export const StreakCounter = () => {
  const { data: streak } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);

      const { data: entries } = await supabase
        .from("food_diary")
        .select("date")
        .gte("date", format(thirtyDaysAgo, "yyyy-MM-dd"))
        .lte("date", format(today, "yyyy-MM-dd"))
        .order("date", { ascending: false });

      if (!entries?.length) return 0;

      const uniqueDates = [...new Set(entries.map(entry => entry.date))];
      
      const allDates = eachDayOfInterval({ 
        start: thirtyDaysAgo,
        end: today 
      }).map(date => format(date, "yyyy-MM-dd"));

      let currentStreak = 0;
      for (let i = 0; i < allDates.length; i++) {
        const date = allDates[allDates.length - 1 - i];
        if (uniqueDates.includes(date)) {
          currentStreak++;
        } else {
          break;
        }
      }

      return currentStreak;
    },
  });

  // Only render if there's an actual streak (greater than 0)
  if (!streak || streak === 0) return null;

  return (
    <Card className="bg-background border border-primary/20">
      <CardContent className="py-4 flex items-center justify-center gap-2 bg-primary/10">
        <Medal className="w-5 h-5 text-primary" />
        <span className="text-lg font-medium">{streak} Day Streak!</span>
      </CardContent>
    </Card>
  );
};