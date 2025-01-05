import React, { useState } from "react";
import { FoodDiary } from "@/components/FoodDiary";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FoodDiaryPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);

  const { data: apiKey, isLoading } = useQuery({
    queryKey: ["openai-api-key"],
    queryFn: async () => {
      console.log("Starting API key fetch process...");
      
      // First try localStorage
      const savedKey = localStorage.getItem("openai_api_key");
      if (savedKey) {
        console.log("Found API key in localStorage");
        return savedKey;
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        toast.error("Please log in to use this feature");
        return null;
      }

      // If not in localStorage, try Supabase secrets
      const { data, error } = await supabase
        .from("secrets")
        .select("value")
        .eq("name", "OPENAI_API_KEY")
        .single();

      if (error) {
        console.error("Error fetching API key:", error);
        toast.error("Error fetching API key");
        throw error;
      }

      if (!data?.value) {
        console.error("No API key found in Supabase");
        toast.error("Please set your OpenAI API key in API Settings first");
        return null;
      }

      console.log("Successfully retrieved API key from Supabase");
      // Save to localStorage for future use
      localStorage.setItem("openai_api_key", data.value);
      return data.value;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-muted-foreground animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

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