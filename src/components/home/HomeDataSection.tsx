import React, { useState } from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { useHomeData } from "@/components/home/useHomeData";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { MacroCircles } from "@/components/home/MacroCircles";
import { Card } from "@/components/ui/card";

export const HomeDataSection = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState<any>(null);
  const imageAnalysisSectionRef = React.useRef<any>(null);

  const { isLoading } = useHomeData();

  return (
    <div className="space-y-4">
      {/* Streak Counter - Full Width */}
      <div className="w-full">
        <StreakCounter />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - Habit Tracking */}
        <Card className="p-4 bg-white dark:bg-gray-800">
          <HabitTracker />
        </Card>

        {/* Right Column - Stacked Elements */}
        <div className="flex flex-col gap-4">
          {/* Today's Nutrition */}
          <Card className="p-4 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-3">Today's Nutrition</h2>
            <MacroCircles />
          </Card>

          {/* Food Input Section */}
          <Card className="p-4 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-3">Add Food</h2>
            <ImageAnalysisSection
              ref={imageAnalysisSectionRef}
              analyzing={analyzing}
              setAnalyzing={setAnalyzing}
              nutritionData={nutritionData}
              setNutritionData={setNutritionData}
              selectedDate={new Date()}
            />
          </Card>

          {/* Weight Input Section */}
          <Card className="p-4 bg-white dark:bg-gray-800">
            <WeightInput />
          </Card>
        </div>
      </div>
    </div>
  );
};