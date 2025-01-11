import { useState, useEffect } from "react";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsContent } from "@/components/reports/ReportsContent";
import { TimeRange } from "@/components/reports/TimeRangeSelector";
import { useReportsData } from "@/components/reports/useReportsData";
import { processCalorieData, processMacroData, processMealData } from "@/components/reports/DataProcessor";
import { startOfDay, endOfDay, subDays, subWeeks, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

export const Reports = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1w");
  const navigate = useNavigate();
  const { foodData, weightData, waterData, isLoading } = useReportsData(timeRange);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Calculate date range based on timeRange
  const endDate = endOfDay(new Date());
  let startDate: Date;

  switch (timeRange) {
    case "1d":
      startDate = startOfDay(subDays(new Date(), 1));
      break;
    case "1w":
      startDate = startOfDay(subWeeks(new Date(), 1));
      break;
    case "1m":
      startDate = startOfDay(subMonths(new Date(), 1));
      break;
    case "3m":
      startDate = startOfDay(subMonths(new Date(), 3));
      break;
    case "6m":
      startDate = startOfDay(subMonths(new Date(), 6));
      break;
    case "1y":
      startDate = startOfDay(subMonths(new Date(), 12));
      break;
    default:
      startDate = startOfDay(subWeeks(new Date(), 1));
  }

  const calorieData = foodData ? processCalorieData(foodData, startDate, endDate) : [];
  const macroData = foodData ? processMacroData(foodData, startDate, endDate) : [];
  const mealData = foodData ? processMealData(foodData, startDate, endDate) : [];

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container max-w-7xl mx-auto p-4 space-y-4 pb-20">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-muted-foreground animate-pulse">
              Loading reports...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container max-w-7xl mx-auto p-4 space-y-4 pb-20">
        <ReportsHeader
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        <ReportsContent
          calorieData={calorieData}
          macroData={macroData}
          mealData={mealData}
          weightData={weightData}
          waterData={waterData}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </>
  );
};