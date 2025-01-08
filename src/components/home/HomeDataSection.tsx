import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHomeData } from "@/components/home/useHomeData";
import { HabitTracker } from "@/components/habits/HabitTracker";

export const HomeDataSection = () => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState<any>(null);
  const imageAnalysisSectionRef = React.useRef<any>(null);

  const { isLoading } = useHomeData();

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg">
        <StreakCounter />
      </div>

      <div className="p-4">
        <HabitTracker />
      </div>

      <div className="p-4">
        <ImageAnalysisSection
          ref={imageAnalysisSectionRef}
          analyzing={analyzing}
          setAnalyzing={setAnalyzing}
          nutritionData={nutritionData}
          setNutritionData={setNutritionData}
          selectedDate={new Date()}
        />
      </div>

      <div className="p-4">
        <WeightInput />
      </div>
    </div>
  );
};