import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { useHomeData } from "@/components/home/useHomeData";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { MacroCircles } from "@/components/home/MacroCircles";
import { WeightTrendChart } from "@/components/reports/WeightTrendChart";
import { Card } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export const HomeDataSection = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState<any>(null);
  const imageAnalysisSectionRef = React.useRef<any>(null);
  const { isLoading, weightData } = useHomeData();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
        </div>
        <StreakCounter />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Nutrition & Stats (4 columns) */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* Today's Nutrition Card */}
          <Card className="p-6 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">Today's Nutrition</h2>
            <MacroCircles />
          </Card>

          {/* Habit Tracking Card */}
          <Card className="bg-white dark:bg-gray-800">
            <HabitTracker />
          </Card>
        </div>

        {/* Center Column - Weight & Charts (5 columns) */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          {/* Weight Trend Chart */}
          <Card className="p-6 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4">Weight Progress</h2>
            {weightData && weightData.length > 0 ? (
              <WeightTrendChart data={weightData} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No weight data available
              </p>
            )}
          </Card>

          {/* Weight Input Section */}
          <Card className="bg-white dark:bg-gray-800">
            <WeightInput />
          </Card>
        </div>

        {/* Right Column - Food Analysis (3 columns) */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          {/* Food Analysis Card */}
          <Card className="bg-white dark:bg-gray-800">
            <ImageAnalysisSection
              ref={imageAnalysisSectionRef}
              analyzing={analyzing}
              setAnalyzing={setAnalyzing}
              nutritionData={nutritionData}
              setNutritionData={setNutritionData}
              selectedDate={new Date()}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};