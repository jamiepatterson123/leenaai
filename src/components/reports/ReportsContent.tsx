
import { useState, useEffect } from "react";
import { WeightTrendChart } from "./WeightTrendChart";
import { CalorieTargetsChart } from "./CalorieTargetsChart";
import { CalorieChart } from "./CalorieChart";
import { MacroChart } from "./MacroChart";
import { MacroTargetsChart } from "./MacroTargetsChart";
import { MealDistributionChart } from "./MealDistributionChart";
import { CalorieStateChart } from "./CalorieStateChart";
import { MacroDailyChart } from "./MacroDailyChart";
import { ChartSettings, VisibleCharts, defaultVisibleCharts } from "./ChartSettings";
import { TimeRange } from "./TimeRangeSelector";
import { WaterConsumptionChart } from "./WaterConsumptionChart";
import { NutritionTable } from "./NutritionTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReportsContentProps {
  weightData: any[];
  calorieData: any[];
  macroData: any[];
  mealData: any[];
  waterData: any[];
  isLoading: boolean;
  timeRange: TimeRange;
}

export const ReportsContent = ({ 
  weightData, 
  calorieData, 
  macroData, 
  mealData,
  waterData,
  isLoading,
  timeRange
}: ReportsContentProps) => {
  // States for chart visibility and view mode
  const [visibleCharts, setVisibleCharts] = useState<VisibleCharts>({...defaultVisibleCharts});
  const [viewMode, setViewMode] = useState<"charts" | "table">("charts");

  // Get user profile with chart settings
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("target_calories, target_protein, target_carbs, target_fat, chart_settings")
        .eq("user_id", user.id)
        .single();

      return data;
    },
  });

  // Load saved settings when profile is fetched
  useEffect(() => {
    if (profile?.chart_settings) {
      // Load saved visible charts if available
      if (profile.chart_settings.visibleCharts) {
        setVisibleCharts(profile.chart_settings.visibleCharts);
      }
      
      // Load saved view mode if available
      if (profile.chart_settings.viewMode) {
        setViewMode(profile.chart_settings.viewMode);
      }
    }
  }, [profile]);

  const handleToggleChart = (chart: keyof VisibleCharts) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chart]: !prev[chart]
    }));
  };

  const targetCalories = profile?.target_calories || 2000;
  const targetProtein = profile?.target_protein || 150;
  const targetCarbs = profile?.target_carbs || 200;
  const targetFat = profile?.target_fat || 70;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-6">
      <ChartSettings 
        visibleCharts={visibleCharts} 
        onToggleChart={handleToggleChart}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {viewMode === "charts" ? (
        <div className="grid gap-4 md:gap-6">
          {/* Weight Trend */}
          {visibleCharts.weightTrend && (
            <WeightTrendChart 
              data={weightData}
            />
          )}
          
          {/* Calories per day */}
          {visibleCharts.calories && (
            <CalorieChart data={calorieData} />
          )}
          
          {/* Macronutrients daily charts */}
          {visibleCharts.proteinDaily && (
            <MacroDailyChart 
              data={macroData}
              type="protein"
            />
          )}
          {visibleCharts.carbsDaily && (
            <MacroDailyChart 
              data={macroData}
              type="carbs"
            />
          )}
          {visibleCharts.fatDaily && (
            <MacroDailyChart 
              data={macroData}
              type="fat"
            />
          )}
          
          {/* Calories per meal and state */}
          {visibleCharts.mealDistribution && (
            <MealDistributionChart data={mealData} />
          )}
          {visibleCharts.calorieState && (
            <CalorieStateChart data={mealData} />
          )}
          
          {/* Macronutrient averages */}
          {visibleCharts.macros && (
            <MacroChart data={macroData} />
          )}
          
          {/* Weekly averages vs targets */}
          {visibleCharts.calorieTargets && (
            <CalorieTargetsChart data={calorieData} />
          )}
          {visibleCharts.macroTargets && (
            <MacroTargetsChart data={macroData} />
          )}

          {/* Water consumption chart */}
          {visibleCharts.waterConsumption && waterData.length > 0 && (
            <WaterConsumptionChart data={waterData} />
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {/* Nutrition Table */}
          {visibleCharts.nutritionTable && (
            <NutritionTable 
              data={macroData}
              targetCalories={targetCalories}
              targetProtein={targetProtein}
              targetCarbs={targetCarbs}
              targetFat={targetFat}
            />
          )}
        </div>
      )}
    </div>
  );
};
