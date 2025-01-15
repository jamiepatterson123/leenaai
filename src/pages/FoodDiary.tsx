import React from "react";
import { FoodDiary } from "@/components/FoodDiary";
import { Card } from "@/components/ui/card";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { useSearchParams, useNavigate } from "react-router-dom";
import { parse, format } from "date-fns";
import { CalendarGrid } from "@/components/habits/CalendarGrid";
import { MonthNavigation } from "@/components/habits/MonthNavigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, lastDayOfMonth } from "date-fns";

const FoodDiaryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateParam = searchParams.get('date');
  const [currentDate, setCurrentDate] = React.useState(
    dateParam ? parse(dateParam, 'yyyy-MM-dd', new Date()) : new Date()
  );
  
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState(null);

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

  const allDays = [
    ...getPreviousMonthDays(),
    ...eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    }).map(date => ({ date })),
    ...getNextMonthDays(),
  ];

  return (
    <div className="max-w-7xl mx-auto md:px-4 py-6 mb-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
        {/* Main content area - nutrition info */}
        <div className="order-1 md:order-1 px-4 md:px-0">
          <FoodDiary selectedDate={dateParam ? parse(dateParam, 'yyyy-MM-dd', new Date()) : new Date()} />
        </div>
        
        {/* Sidebar - calendar and image analysis */}
        <div className="order-2 md:order-2 space-y-6">
          <div className="px-4 md:px-0">
            <Card className="w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800 rounded-lg p-4">
              <MonthNavigation
                currentDate={currentDate}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />
              <CalendarGrid
                days={allDays}
                loggedDays={loggedDays || []}
              />
            </Card>
          </div>
          <div className="px-4 md:px-0">
            <ImageAnalysisSection
              analyzing={analyzing}
              setAnalyzing={setAnalyzing}
              nutritionData={nutritionData}
              setNutritionData={setNutritionData}
              selectedDate={dateParam ? parse(dateParam, 'yyyy-MM-dd', new Date()) : new Date()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryPage;