import React, { useState } from "react";
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
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReportsContent } from "@/components/reports/ReportsContent";
import { ProfileHeader } from "@/components/home/ProfileHeader";
import { CameraButton } from "@/components/home/CameraButton";
import { useHomeData } from "@/components/home/useHomeData";

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const today = format(new Date(), "yyyy-MM-dd");
  const isMobile = useIsMobile();

  const { weightData, calorieData, macroData, mealData, isLoading } = useHomeData();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        toast.error("Error fetching profile");
        throw error;
      }

      return data;
    },
  });

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

  const { data: apiKey } = useQuery({
    queryKey: ["openai-api-key"],
    queryFn: async () => {
      const savedKey = localStorage.getItem("openai_api_key");
      if (savedKey) {
        return savedKey;
      }

      const { data, error } = await supabase
        .from("secrets")
        .select("value")
        .eq("name", "OPENAI_API_KEY")
        .maybeSingle();

      if (error) {
        toast.error("Error fetching API key");
        throw error;
      }

      if (!data) {
        toast.error("Please set your OpenAI API key in API Settings first");
        return null;
      }

      return data.value;
    },
  });

  const handleFileSelect = (file: File) => {
    const event = new CustomEvent('imageSelected', { detail: file });
    window.dispatchEvent(event);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-20 md:pb-8">
      <ProfileHeader profile={profile} />
      
      <div className="space-y-8">
        <StreakCounter />
        
        {hasTodayEntries && (
          <div className="animate-fade-up">
            <h2 className="text-2xl font-semibold mb-4">Today's Food Diary</h2>
            <FoodDiary selectedDate={new Date()} />
          </div>
        )}

        <ReportsContent 
          weightData={weightData || []}
          calorieData={calorieData || []}
          macroData={macroData || []}
          mealData={mealData || []}
          isLoading={isLoading}
        />

        <CameraButton onFileSelect={handleFileSelect} />

        <ImageAnalysisSection
          apiKey={apiKey}
          analyzing={analyzing}
          setAnalyzing={setAnalyzing}
          nutritionData={nutritionData}
          setNutritionData={setNutritionData}
          selectedDate={new Date()}
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