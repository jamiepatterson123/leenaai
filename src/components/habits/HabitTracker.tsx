import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="flex items-center justify-between w-full mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-medium">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="w-full">
          <div className="grid grid-cols-7 gap-2 text-center mb-3">
            {["S", "M", "T", "W", "T", "F", "S"].map(day => (
              <div key={day} className="text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
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
                    aspect-square rounded-md border text-center flex items-center justify-center
                    ${isLogged ? 'bg-success/10 border-success/20' : 'border-gray-100 dark:border-gray-800'}
                    transition-colors duration-200
                  `}
                >
                  <span className="text-sm text-muted-foreground">
                    {format(day, "d")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};