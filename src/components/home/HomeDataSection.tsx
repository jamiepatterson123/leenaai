
import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { MacroCircles } from "@/components/home/MacroCircles";
import { WeightTrendChart } from "@/components/reports/WeightTrendChart";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { useSubscription } from "@/hooks/useSubscription";
import { useHomeData } from "@/components/home/useHomeData";

export const HomeDataSection = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState<any>(null);
  const imageAnalysisSectionRef = React.useRef<any>(null);
  const isMobile = useIsMobile();
  const today = new Date();
  const { isSubscribed } = useSubscription();

  const { isLoading, weightData } = useHomeData();

  return (
    <div className="space-y-6">
      {/* Streak Counter removed from here */}

      {/* Today's Macros - Mobile Only */}
      <div className="md:hidden w-full">
        <h2 className="text-lg font-semibold mb-2 text-center mt-5">Today</h2>
        {/* Date display for subscribers - currently hidden
        {isSubscribed && (
          <p className="text-sm text-gray-500 mb-4 text-center">
            {format(today, "EEEE, MMMM d, yyyy")}
          </p>
        )}
        */}
        <div className="bg-white rounded-lg p-4">
          <MacroCircles />
        </div>
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
            {/* Date display for desktop - currently hidden
            <p className="text-sm text-gray-500 mb-4">
              {format(today, "EEEE, MMMM d, yyyy")}
            </p>
            */}
            <MacroCircles />
          </div>

          {/* Food Input Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <ImageAnalysisSection
              ref={imageAnalysisSectionRef}
              analyzing={analyzing}
              setAnalyzing={setAnalyzing}
              nutritionData={nutritionData}
              setNutritionData={setNutritionData}
              selectedDate={new Date()}
            />
          </div>

          {/* Weight Trend Chart Section - Hidden on Mobile */}
          <div className="hidden md:block w-full bg-white rounded-lg border border-gray-200">
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
          <div className="w-full bg-white rounded-lg border border-gray-200">
            <WeightInput />
          </div>
        </div>
      </div>
    </div>
  );
};
