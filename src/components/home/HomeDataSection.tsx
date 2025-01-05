import React from "react";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { FoodDiary } from "@/components/FoodDiary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHomeData } from "@/components/home/useHomeData";
import { Card } from "@/components/ui/card";

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

  return (
    <div className="space-y-6">
      <StreakCounter />

      {isMobile ? (
        <Card className="p-4">
          <ImageAnalysisSection
            ref={imageAnalysisSectionRef}
            apiKey={apiKey}
            analyzing={analyzing}
            setAnalyzing={setAnalyzing}
            nutritionData={nutritionData}
            setNutritionData={setNutritionData}
            selectedDate={new Date()}
          />
        </Card>
      ) : (
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

      <Card className="p-4">
        <WeightInput />
      </Card>
      
      {hasTodayEntries && (
        <div className="animate-fade-up">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Today's Food Diary</h2>
            <FoodDiary selectedDate={new Date()} />
          </Card>
        </div>
      )}
    </div>
  );
};