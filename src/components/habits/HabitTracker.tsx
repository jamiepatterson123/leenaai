import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, lastDayOfMonth } from "date-fns";
import { HabitTrackerHeader } from "./HabitTrackerHeader";
import { MonthNavigation } from "./MonthNavigation";
import { CalendarGrid } from "./CalendarGrid";
import { useNavigate } from "react-router-dom";

interface HabitTrackerProps {
  onDateSelect?: (date: Date) => void;
}

export const HabitTracker = ({ onDateSelect }: HabitTrackerProps) => {
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
    const lastDayOfCurrentMonth = endOfMonth(currentDate);
    const remainingDays = 6 - lastDayOfCurrentMonth.getDay();
    const nextMonth = addMonths(currentDate, 1);
    
    return Array.from({ length: remainingDays }, (_, i) => {
      return { date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i + 1), isNextMonth: true };
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else {
      // If no onDateSelect prop is provided, navigate to food diary
      navigate(`/food-diary?date=${format(date, 'yyyy-MM-dd')}`);
    }
  };

  const allDays = [
    ...getPreviousMonthDays(),
    ...eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    }).map(date => ({ date })),
    ...getNextMonthDays(),
  ];

  return (
    <div className="w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800 rounded-lg">
      <div className="p-4">
        <MonthNavigation
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
        <CalendarGrid
          days={allDays}
          loggedDays={loggedDays || []}
          onDateSelect={handleDateClick}
        />
      </div>
    </div>
  );
};