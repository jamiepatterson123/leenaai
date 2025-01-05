import React, { useState } from "react";
import { WeightInput } from "@/components/WeightInput";
import { StreakCounter } from "@/components/StreakCounter";
import { FoodDiary } from "@/components/FoodDiary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHomeData } from "@/components/home/useHomeData";
import { CameraButton } from "./CameraButton";
import { ImageAnalyzer } from "../analysis/ImageAnalyzer";
import { Button } from "../ui/button";

export const HomeDataSection = () => {
  const today = format(new Date(), "yyyy-MM-dd");
  const isMobile = useIsMobile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    setSelectedFile(file);
  };

  const handleAnalysisComplete = async (foods: Array<{
    name: string;
    weight_g: number;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      for (const food of foods) {
        const { error } = await supabase
          .from('food_diary')
          .insert({
            user_id: user.id,
            food_name: food.name,
            weight_g: food.weight_g,
            calories: food.nutrition.calories,
            protein: food.nutrition.protein,
            carbs: food.nutrition.carbs,
            fat: food.nutrition.fat,
            date: today,
          });

        if (error) throw error;
      }

      setSelectedFile(null);
    } catch (error) {
      console.error('Error saving food entries:', error);
      toast.error('Failed to save food entries');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg">
        <StreakCounter />
      </div>

      <div className="p-4">
        {selectedFile ? (
          <ImageAnalyzer
            imageFile={selectedFile}
            onAnalysisComplete={handleAnalysisComplete}
            onCancel={() => setSelectedFile(null)}
          />
        ) : (
          <CameraButton onFileSelect={handleFileSelect} />
        )}
      </div>

      <div className="p-4">
        <WeightInput />
      </div>
      
      {hasTodayEntries && (
        <div className="animate-fade-up p-4">
          <h2 className="text-xl font-semibold mb-4">Today's Food Diary</h2>
          <FoodDiary selectedDate={new Date()} />
        </div>
      )}
    </div>
  );
};