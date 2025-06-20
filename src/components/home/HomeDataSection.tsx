import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { MacroCircles } from "@/components/home/MacroCircles";
import { WeightTrendChart } from "@/components/reports/WeightTrendChart";
import { QuickWeightInput } from "@/components/home/QuickWeightInput";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHomeData } from "@/components/home/useHomeData";
export const HomeDataSection = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState<any>(null);
  const imageAnalysisSectionRef = React.useRef<any>(null);
  const isMobile = useIsMobile();
  const {
    isLoading,
    weightData
  } = useHomeData();
  return <div className="space-y-6">
      {/* Today's Macros - Mobile Only */}
      <div className="md:hidden w-full">
        <h2 className="text-lg font-semibold mb-2 text-center mt-5">Today</h2>
        <div className="bg-white rounded-lg p-4">
          <MacroCircles />
        </div>
      </div>

      {/* Quick Weight Input - Mobile Only */}
      <div className="md:hidden w-full">
        <QuickWeightInput />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Habit Tracking */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <HabitTracker />
          </div>
        </div>

        {/* Right Column - Input Sections and Today's Nutrition */}
        <div className="space-y-4 h-full">
          {/* Today's Nutrition - Desktop Only */}
          <div className="hidden md:block bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Today's Nutrition</h2>
            <MacroCircles />
          </div>

          {/* Quick Weight Input - Desktop Only */}
          <div className="hidden md:block">
            <QuickWeightInput />
          </div>

          {/* Food Input Section - No longer protected */}
          <div className="bg-white rounded-lg border border-gray-200">
            <ImageAnalysisSection ref={imageAnalysisSectionRef} analyzing={analyzing} setAnalyzing={setAnalyzing} nutritionData={nutritionData} setNutritionData={setNutritionData} selectedDate={new Date()} />
          </div>

          {/* Weight Trend Chart Section - Hidden on Mobile */}
          <div className="hidden md:block w-full bg-white rounded-lg border border-gray-200">
            {isLoading ? <p className="text-center text-gray-500 p-4">Loading weight data...</p> : weightData && weightData.length > 0 ? <WeightTrendChart data={weightData} /> : <div className="p-4">
                <p className="text-center text-gray-500 mb-2">No weight data available</p>
                <p className="text-center text-sm text-gray-400">Add your first weight entry above</p>
              </div>}
          </div>

          {/* Weight Input Section - Desktop Only */}
          
        </div>
      </div>
    </div>;
};