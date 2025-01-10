import React, { useState } from "react";
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
  const isMobile = useIsMobile();

  const { isLoading } = useHomeData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column - Consistency Tracking */}
      <div className="space-y-6">
        <div className="rounded-lg">
          <StreakCounter />
        </div>

        <div className="p-4">
          <HabitTracker />
        </div>
      </div>

      {/* Right Column - Input Section */}
      <div className="space-y-6">
        <div className="p-4 bg-background rounded-lg border border-border/40">
          <ImageAnalysisSection
            ref={imageAnalysisSectionRef}
            analyzing={analyzing}
            setAnalyzing={setAnalyzing}
            nutritionData={nutritionData}
            setNutritionData={setNutritionData}
            selectedDate={new Date()}
          />
        </div>

        <div className="p-4 bg-background rounded-lg border border-border/40">
          <WeightInput />
        </div>
      </div>
    </div>
  );
};