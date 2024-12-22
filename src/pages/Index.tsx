import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WeightInput } from "@/components/WeightInput";
import { TargetsDisplay } from "@/components/profile/TargetsDisplay";
import { calculateTargets } from "@/utils/profileCalculations";
import { WeightChart } from "@/components/WeightChart";
import { FoodAnalysis } from "@/components/food/FoodAnalysis";
import { FoodLoggingCalendar } from "@/components/FoodLoggingCalendar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const Index = () => {
  const [targets, setTargets] = useState<any>(null);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: foodEntries = [] } = useQuery({
    queryKey: ["foodDiary", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_diary")
        .select("*")
        .eq("date", today)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load food diary");
        throw error;
      }

      return data || [];
    },
  });

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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("food_diary")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Food entry deleted");
      queryClient.invalidateQueries({ queryKey: ["foodDiary", today] });
    } catch (error) {
      toast.error("Failed to delete food entry");
      console.error("Error deleting food entry:", error);
    }
  };

  const handleUpdateCategory = async (id: string, category: string) => {
    try {
      const { error } = await supabase
        .from("food_diary")
        .update({ category })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Moved to ${category}`);
      queryClient.invalidateQueries({ queryKey: ["foodDiary", today] });
    } catch (error) {
      toast.error("Failed to update food category");
      console.error("Error updating food category:", error);
    }
  };

  const foods = foodEntries.map((entry) => ({
    id: entry.id,
    name: entry.food_name,
    weight_g: entry.weight_g,
    category: entry.category,
    nutrition: {
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    },
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Focused Nutrition
      </h1>
      <div className="space-y-8">
        {targets && <TargetsDisplay targets={targets} />}
        <WeightInput />
        <WeightChart />
        <FoodLoggingCalendar />
        <FoodAnalysis 
          foods={foods}
          onDelete={handleDelete}
          onUpdateCategory={handleUpdateCategory}
        />
        <div className="text-center py-4">
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