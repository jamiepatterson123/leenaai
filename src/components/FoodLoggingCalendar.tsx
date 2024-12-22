import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useNavigate } from "react-router-dom";

export const FoodLoggingCalendar = () => {
  const [date, setDate] = React.useState<Date>(new Date());
  const navigate = useNavigate();

  const { data: loggedDays } = useQuery({
    queryKey: ["foodLoggedDays", format(date, "yyyy-MM")],
    queryFn: async () => {
      const startDate = format(startOfMonth(date), "yyyy-MM-dd");
      const endDate = format(endOfMonth(date), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("food_diary")
        .select("date")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date");

      if (error) throw error;

      const uniqueDates = [...new Set(data.map(entry => entry.date))];
      return uniqueDates.map(date => new Date(date));
    },
  });

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      navigate(`/food-diary?date=${format(newDate, "yyyy-MM-dd")}`);
    }
  };

  return (
    <Card className="p-6 bg-background">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your logs</h2>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md cursor-pointer"
          modifiers={{
            logged: loggedDays || [],
          }}
          modifiersStyles={{
            logged: {
              color: "white",
              backgroundColor: "hsl(var(--primary))",
            },
          }}
          components={{
            IconLeft: ({ ...props }) => (
              <ChevronLeft className="h-4 w-4" {...props} />
            ),
            IconRight: ({ ...props }) => (
              <ChevronRight className="h-4 w-4" {...props} />
            ),
          }}
        />
      </div>
    </Card>
  );
};