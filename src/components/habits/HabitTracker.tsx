import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, lastDayOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const HabitTracker = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const navigate = useNavigate();
  
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

  const handleDateClick = (date: Date) => {
    navigate(`/food-diary?date=${format(date, "yyyy-MM-dd")}`);
  };

  // Get the days from previous month that should appear in the calendar
  const getPreviousMonthDays = () => {
    const firstDayOfMonth = startOfMonth(currentDate);
    const daysFromPreviousMonth = firstDayOfMonth.getDay();
    const previousMonth = subMonths(firstDayOfMonth, 1);
    const lastDayOfPreviousMonth = lastDayOfMonth(previousMonth);
    
    return Array.from({ length: daysFromPreviousMonth }, (_, i) => {
      const day = lastDayOfPreviousMonth.getDate() - daysFromPreviousMonth + i + 1;
      return { date: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), day), isPreviousMonth: true };
    });
  };

  // Get the days from next month that should appear in the calendar
  const getNextMonthDays = () => {
    const lastDayOfMonth = endOfMonth(currentDate);
    const remainingDays = 6 - lastDayOfMonth.getDay();
    const nextMonth = addMonths(currentDate, 1);
    
    return Array.from({ length: remainingDays }, (_, i) => {
      return { date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i + 1), isNextMonth: true };
    });
  };

  return (
    <div className="w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="p-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Consistency Is Key</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom"
                align="center"
                className="max-w-[250px] text-center"
              >
                <p>Any day you log your food will be shaded in gold. Try to make the entire calendar gold by the end of the month!</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-0 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-xs text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0">
          {getPreviousMonthDays().map(({ date }) => (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className="aspect-square border border-border/50 flex items-center justify-center hover:bg-accent/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground/50">
                {format(date, "d")}
              </span>
            </button>
          ))}
          
          {days.map(day => {
            const isLogged = loggedDays?.some(loggedDate => 
              isSameDay(new Date(loggedDate), day)
            );
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square border flex items-center justify-center
                  ${isLogged ? 'bg-[#F59E0B] border-[#F59E0B]/30' : 'border-border/50'}
                  hover:bg-accent/50 transition-colors duration-200
                `}
              >
                <span className="text-xs text-muted-foreground">
                  {format(day, "d")}
                </span>
              </button>
            );
          })}

          {getNextMonthDays().map(({ date }) => (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className="aspect-square border border-border/50 flex items-center justify-center hover:bg-accent/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground/50">
                {format(date, "d")}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};