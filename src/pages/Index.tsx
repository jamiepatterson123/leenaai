import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WeightInput } from "@/components/WeightInput";
import { TargetsDisplay } from "@/components/profile/TargetsDisplay";
import { WeightChart } from "@/components/WeightChart";
import { FoodAnalysis } from "@/components/food/FoodAnalysis";
import { FoodLoggingCalendar } from "@/components/FoodLoggingCalendar";
import { useNutritionTargets } from "@/components/nutrition/useNutritionTargets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ImageUpload";

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

  const handleImageSelect = async (file: File) => {
    try {
      toast.info("Processing image...");
      // Here you can add the image processing logic
      // For example, sending it to an API for food recognition
      console.log("Selected image:", file);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to process image");
      console.error("Error processing image:", error);
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
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-primary">
            Nutrition Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your nutrition journey with precision
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Daily Targets */}
          <Card className="border border-primary/10 shadow-lg bg-gradient-to-b from-background to-primary/5">
            <CardContent className="pt-6">
              {targets && <TargetsDisplay targets={targets} />}
            </CardContent>
          </Card>

          {/* Image Upload Section */}
          <Card className="border border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Upload Food Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageSelect={handleImageSelect} />
            </CardContent>
          </Card>

          {/* Weight Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-primary/10 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Weight Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightInput />
              </CardContent>
            </Card>

            <Card className="border border-primary/10 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Progress Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <WeightChart />
              </CardContent>
            </Card>
          </div>

          {/* Food Calendar */}
          <Card className="border border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Meal Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <FoodLoggingCalendar />
            </CardContent>
          </Card>

          {/* Food Analysis */}
          <Card className="border border-primary/10 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Nutrition Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <FoodAnalysis 
                foods={foods}
                onDelete={handleDelete}
                onUpdateCategory={handleUpdateCategory}
              />
            </CardContent>
          </Card>

          {/* Footer Link */}
          <div className="text-center pt-4">
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