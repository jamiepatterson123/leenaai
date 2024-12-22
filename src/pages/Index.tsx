import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WeightInput } from "@/components/WeightInput";
import { calculateTargets } from "@/utils/profileCalculations";
import { Header } from "@/components/home/Header";
import { DailyTargetsSection } from "@/components/home/DailyTargetsSection";
import { ImageAnalysisSection } from "@/components/home/ImageAnalysisSection";
import { NutritionSection } from "@/components/home/NutritionSection";

const Index = () => {
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [targets, setTargets] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const calculatedTargets = calculateTargets(profile);
        setTargets(calculatedTargets);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <Header />
      <div className="space-y-8">
        <DailyTargetsSection targets={targets} />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <ImageAnalysisSection onAnalysisComplete={setNutritionData} />
            <WeightInput />
          </div>
          <NutritionSection nutritionData={nutritionData} />
        </div>
      </div>
    </div>
  );
};

export default Index;