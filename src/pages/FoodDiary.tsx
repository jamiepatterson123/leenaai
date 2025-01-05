import React, { useState } from "react";
import { FoodDiary } from "@/components/FoodDiary";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FoodDiaryPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);

  const { data: apiKey } = useQuery({
    queryKey: ["openai-api-key"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secrets")
        .select("value")
        .eq("name", "OPENAI_API_KEY")
        .single();

      if (error) {
        console.error("Error fetching API key:", error);
        throw error;
      }

      return data?.value;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
        {/* Main content area - nutrition info */}
        <div className="order-1 md:order-1">
          <FoodDiary selectedDate={date} />
        </div>
        
        {/* Sidebar - calendar and image analysis */}
        <div className="order-2 md:order-2 space-y-6">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md"
            />
          </Card>
          <ImageAnalysisSection
            apiKey={apiKey}
            analyzing={analyzing}
            setAnalyzing={setAnalyzing}
            nutritionData={nutritionData}
            setNutritionData={setNutritionData}
            selectedDate={date}
          />
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryPage;