import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { useHomeData } from "@/components/home/useHomeData";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { MacroCircles } from "@/components/home/MacroCircles";
import { WeightTrendChart } from "@/components/reports/WeightTrendChart";
import { NaturalLanguageInput } from "@/components/food/NaturalLanguageInput";

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
        <div className="space-y-6 bg-white">
          <div className="bg-white rounded-lg shadow-sm">
            <HabitTracker />
          </div>
        </div>

        {/* Right Column - Input Sections and Today's Nutrition */}
        <div className="space-y-4 h-full">
          {/* Today's Nutrition - Desktop Only */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Today's Nutrition</h2>
            <MacroCircles />
          </div>

          {/* Natural Language Input - Mobile Only */}
          <div className="md:hidden bg-white rounded-lg shadow-sm p-4">
            <NaturalLanguageInput />
          </div>

          {/* Food Input Section */}
          <div className="bg-white rounded-lg shadow-sm">
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
          <div className="w-full bg-white rounded-lg shadow-sm border border-border">
            {isLoading ? (
              <p className="text-center text-gray-500 p-4">Loading weight data...</p>
            ) : weightData && weightData.length > 0 ? (
              <WeightTrendChart data={weightData} />
            ) : (
              <div className="p-4">
                <p className="text-center text-gray-500 mb-2">No weight data available</p>
                <p className="text-center text-sm text-gray-400">Add your first weight entry below</p>
              </div>
            )}
          </div>

          {/* Weight Input Section */}
          <div className="w-full bg-white rounded-lg shadow-sm">
            <WeightInput />
          </div>
        </div>
      </div>
    </div>
  );
};