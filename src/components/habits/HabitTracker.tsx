import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const HabitTracker = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const { data: loggedDays } = useQuery({
    queryKey: ["habit-tracker", format(currentDate, "yyyy-MM")],
    queryFn: async () => {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      const { data } = await supabase
        .from("food_diary")
        .select("date")
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));
      
      return data?.map(entry => entry.date) || [];
    },
  });

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  return (
    <Card className="p-3 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-6 w-6"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <h2 className="text-sm font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-6 w-6"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map(day => (
          <div key={day} className="text-[10px] text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {days.map(day => {
          const isLogged = loggedDays?.some(loggedDate => 
            isSameDay(new Date(loggedDate), day)
          );
          
          return (
            <div
              key={day.toISOString()}
              className={`
                aspect-square rounded-[2px] border text-center flex items-center justify-center
                ${isLogged ? 'bg-success/20 border-success/30' : 'border-border/50'}
                transition-colors duration-200
              `}
            >
              <span className="text-[9px] text-muted-foreground">
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};