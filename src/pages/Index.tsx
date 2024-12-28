import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { WeightInput } from "@/components/WeightInput";
import { ImageAnalysisSection } from "@/components/analysis/ImageAnalysisSection";
import { StreakCounter } from "@/components/StreakCounter";
import { FoodDiary } from "@/components/FoodDiary";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, subYears, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReportsContent } from "@/components/reports/ReportsContent";
import type { ProfileRow } from "@/integrations/supabase/types/profiles";

const Index = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const today = format(new Date(), "yyyy-MM-dd");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const { data: weightData, isLoading: weightLoading } = useQuery({
    queryKey: ["weightHistory", "1w"],
    queryFn: async () => {
      const startDate = subDays(new Date(), 6);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("weight_kg, updated_at")
        .gte("updated_at", startDate.toISOString())
        .order("updated_at", { ascending: true });

      if (error) throw error;

      return profile.map((entry) => ({
        weight: entry.weight_kg,
        date: format(new Date(entry.updated_at), "MMM d"),
      }));
    },
  });

  const { data: calorieData, isLoading: caloriesLoading } = useQuery({
    queryKey: ["calorieHistory", "1w"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(new Date(), 6);
      
      const { data, error } = await supabase
        .from("food_diary")
        .select("date, calories")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (error) throw error;

      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      const calorieMap = (data || []).reduce((acc: { [key: string]: number }, entry) => {
        acc[entry.date] = entry.calories;
        return acc;
      }, {});

      return dateRange.map(date => ({
        date: format(date, "MMM d"),
        calories: calorieMap[format(date, "yyyy-MM-dd")] || 0,
      }));
    },
  });

  const { data: macroData, isLoading: macrosLoading } = useQuery({
    queryKey: ["macroHistory", "1w"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(new Date(), 6);
      
      const { data, error } = await supabase
        .from("food_diary")
        .select("date, protein, carbs, fat")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (error) throw error;

      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      const macroMaps = {
        protein: {} as { [key: string]: number[] },
        carbs: {} as { [key: string]: number[] },
        fat: {} as { [key: string]: number[] },
      };

      (data || []).forEach(entry => {
        const dateKey = entry.date;
        if (!macroMaps.protein[dateKey]) {
          macroMaps.protein[dateKey] = [];
          macroMaps.carbs[dateKey] = [];
          macroMaps.fat[dateKey] = [];
        }
        macroMaps.protein[dateKey].push(entry.protein);
        macroMaps.carbs[dateKey].push(entry.carbs);
        macroMaps.fat[dateKey].push(entry.fat);
      });

      return dateRange.map(date => {
        const dateKey = format(date, "yyyy-MM-dd");
        const getAverage = (arr: number[]) => 
          arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        return {
          date: format(date, "MMM d"),
          protein: getAverage(macroMaps.protein[dateKey] || []),
          carbs: getAverage(macroMaps.carbs[dateKey] || []),
          fat: getAverage(macroMaps.fat[dateKey] || []),
        };
      });
    },
  });

  const { data: mealData, isLoading: mealsLoading } = useQuery({
    queryKey: ["mealDistribution", "1w"],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = subDays(new Date(), 6);
      
      const { data, error } = await supabase
        .from("food_diary")
        .select("calories, category")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0]);

      if (error) throw error;
      return data || [];
    },
  });

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

      return data as ProfileRow;
    },
  });

  useEffect(() => {
    const checkRecentAdjustments = async () => {
      if (!profile) return;

      const twoDaysAgo = format(subDays(new Date(), 2), "yyyy-MM-dd");
      
      const { data: adjustments } = await supabase
        .from("profiles")
        .select("updated_at, target_calories")
        .eq("id", profile.id)
        .gt("updated_at", twoDaysAgo)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (adjustments && adjustments.length > 0) {
        toast.info(
          "Your daily calorie target has been automatically adjusted to help with your progress. View your new targets in the Profile section.",
          {
            duration: 8000,
            action: {
              label: "View Profile",
              onClick: () => window.location.href = "/profile"
            }
          }
        );
      }
    };

    checkRecentAdjustments();
  }, [profile]);

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

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a custom event with the file
      const event = new CustomEvent('imageSelected', { detail: file });
      window.dispatchEvent(event);
      
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const isLoading = weightLoading || caloriesLoading || macrosLoading || mealsLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        {profile?.first_name ? `Hi ${profile.first_name}, welcome to Leena` : "Welcome to Leena"}
      </h1>
      
      <div className="space-y-8">
        <StreakCounter />
        
        {hasTodayEntries && (
          <div className="animate-fade-up">
            <h2 className="text-2xl font-semibold mb-4">Today's Food Diary</h2>
            <FoodDiary selectedDate={new Date()} />
          </div>
        )}

        {isMobile && (
          <ReportsContent 
            weightData={weightData || []}
            calorieData={calorieData || []}
            macroData={macroData || []}
            mealData={mealData || []}
            isLoading={isLoading}
          />
        )}

        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={handleCameraClick}
            size="lg"
            className="w-full max-w-md flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </div>

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
