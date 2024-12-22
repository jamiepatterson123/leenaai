import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WeightInput } from "@/components/WeightInput";
import { TargetsDisplay } from "@/components/profile/TargetsDisplay";
import { calculateTargets } from "@/utils/profileCalculations";
import { WeightChart } from "@/components/WeightChart";
import { FoodAnalysis } from "@/components/food/FoodAnalysis";

const Index = () => {
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
    <div className="max-w-4xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Focused Nutrition
      </h1>
      <div className="space-y-8">
        {targets && <TargetsDisplay targets={targets} />}
        <div className="grid gap-8 md:grid-cols-2">
          <WeightInput />
          <WeightChart />
        </div>
        <FoodAnalysis />
        <div className="text-center">
          <Link
            to="/food-diary"
            className="text-primary hover:text-primary/80 font-medium"
          >
            View Food Diary →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;