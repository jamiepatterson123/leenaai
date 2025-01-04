import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { FoodDiary } from "@/components/FoodDiary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { CameraButton } from "@/components/home/CameraButton";
import { useHomeData } from "@/components/home/useHomeData";

interface HomeDataSectionProps {
  apiKey: string | null;
}

export const HomeDataSection: React.FC<HomeDataSectionProps> = ({ apiKey }) => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [nutritionData, setNutritionData] = React.useState<any>(null);
  const today = format(new Date(), "yyyy-MM-dd");
  const isMobile = useIsMobile();
  const imageAnalysisSectionRef = React.useRef<any>(null);

  const { isLoading } = useHomeData();

  const { data: hasTodayEntries } = useQuery({
    queryKey: ["hasTodayEntries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("food_diary")
        .select("id")
        .eq("date", today)
        .limit(1);
      
      return data && data.length > 0;
    },
  });

  const handleFileSelect = (file: File) => {
    if (imageAnalysisSectionRef.current) {
      imageAnalysisSectionRef.current.handleImageSelect(file);
    }
  };

  return (
    <div className="space-y-8 md:pt-0 pt-16">
      <StreakCounter />
      
      {isMobile && (
        <>
          <CameraButton onFileSelect={handleFileSelect} />
          <ImageAnalysisSection
            ref={imageAnalysisSectionRef}
            apiKey={apiKey}
            analyzing={analyzing}
            setAnalyzing={setAnalyzing}
            nutritionData={nutritionData}
            setNutritionData={setNutritionData}
            selectedDate={new Date()}
          />
        </>
      )}

      {hasTodayEntries && (
        <div className="animate-fade-up">
          <h2 className="text-2xl font-semibold mb-4">Today's Food Diary</h2>
          <FoodDiary selectedDate={new Date()} />
        </div>
      )}

      {!isMobile && (
        <ImageAnalysisSection
          ref={imageAnalysisSectionRef}
          apiKey={apiKey}
          analyzing={analyzing}
          setAnalyzing={setAnalyzing}
          nutritionData={nutritionData}
          setNutritionData={setNutritionData}
          selectedDate={new Date()}
        />
      )}
      
      <WeightInput />
    </div>
  );
};