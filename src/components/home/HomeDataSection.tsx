import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { useHomeData } from "@/components/home/useHomeData";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { MacroCircles } from "@/components/home/MacroCircles";
import { WeightTrendChart } from "@/components/reports/WeightTrendChart";

export const HomeDataSection = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState<any>(null);
  const imageAnalysisSectionRef = React.useRef<any>(null);

  const { isLoading, weightData } = useHomeData();

  return (
    <div className="space-y-6">
      {/* Streak Counter - Full Width */}
      <div className="w-full">
        <StreakCounter />
      </div>

      {/* Today's Macros - Mobile Only */}
      <div className="md:hidden w-full">
        <h2 className="text-lg font-semibold mb-4 text-center">Today</h2>
        <MacroCircles />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Habit Tracking */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <HabitTracker />
          </div>
        </div>

        {/* Right Column - Input Sections and Today's Nutrition */}
        <div className="space-y-4 h-full">
          {/* Today's Nutrition - Desktop Only */}
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Today's Nutrition</h2>
            <MacroCircles />
          </div>

          {/* Food Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <ImageAnalysisSection
              ref={imageAnalysisSectionRef}
              analyzing={analyzing}
              setAnalyzing={setAnalyzing}
              nutritionData={nutritionData}
              setNutritionData={setNutritionData}
              selectedDate={new Date()}
            />
          </div>

          {/* Weight Trend Chart Section */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border">
            {weightData && weightData.length > 0 ? (
              <WeightTrendChart data={weightData} />
            ) : (
              <p className="text-center text-gray-500">No weight data available</p>
            )}
          </div>

          {/* Weight Input Section */}
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <WeightInput />
          </div>
        </div>
      </div>
    </div>
  );
};