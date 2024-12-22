import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WeightInput } from "@/components/WeightInput";
import { TargetsDisplay } from "@/components/profile/TargetsDisplay";
import { WeightChart } from "@/components/WeightChart";
import { FoodAnalysis } from "@/components/food/FoodAnalysis";
import { FoodLoggingCalendar } from "@/components/FoodLoggingCalendar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const targets = useNutritionTargets();

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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Focused Nutrition
            </h1>
            <p className="text-muted-foreground">
              Track your nutrition journey with precision
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Targets Card */}
            <Card className="md:col-span-2 bg-gradient-to-br from-background to-secondary/20 border-border/5">
              <CardContent className="pt-6">
                {targets && <TargetsDisplay targets={targets} />}
              </CardContent>
            </Card>

            {/* Weight Input Card */}
            <Card className="bg-background border-border/5">
              <CardHeader>
                <CardTitle className="text-xl">Weight Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightInput />
              </CardContent>
            </Card>

            {/* Weight Chart Card */}
            <Card className="bg-background border-border/5">
              <CardHeader>
                <CardTitle className="text-xl">Progress Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightChart />
              </CardContent>
            </Card>

            {/* Food Calendar Card */}
            <Card className="md:col-span-2 bg-background border-border/5">
              <CardHeader>
                <CardTitle className="text-xl">Meal Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <FoodLoggingCalendar />
              </CardContent>
            </Card>

            {/* Food Analysis Card */}
            <Card className="md:col-span-2 bg-background border-border/5">
              <CardHeader>
                <CardTitle className="text-xl">Nutrition Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <FoodAnalysis 
                  foods={foods}
                  onDelete={handleDelete}
                  onUpdateCategory={handleUpdateCategory}
                />
              </CardContent>
            </Card>
          </div>

          {/* Footer Link */}
          <div className="text-center">
            <Link
              to="/food-diary"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View Food Diary
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;