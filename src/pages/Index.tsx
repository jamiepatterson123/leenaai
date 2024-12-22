import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { FoodDiary } from "@/components/FoodDiary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const today = format(new Date(), "yyyy-MM-dd");

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

  useEffect(() => {
    const savedKey = localStorage.getItem("openai_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Focused Nutrition
      </h1>
      <div className="space-y-8">
        <StreakCounter />
        
        {hasTodayEntries && (
          <div className="animate-fade-up">
            <h2 className="text-2xl font-semibold mb-4">Today's Food Diary</h2>
            <FoodDiary selectedDate={new Date()} />
          </div>
        )}

        <ImageAnalysisSection
          apiKey={apiKey}
          analyzing={analyzing}
          setAnalyzing={setAnalyzing}
          nutritionData={nutritionData}
          setNutritionData={setNutritionData}
        />
        <WeightInput />
        <div className="text-center mt-8">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/food-diary" className="inline-flex items-center justify-center gap-2">
              View Food Diary
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;