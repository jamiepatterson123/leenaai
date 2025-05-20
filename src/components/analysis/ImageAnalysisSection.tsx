import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { analyzeImage } from "@/integrations/openai/image-analyzer";
import { FoodVerificationDialog } from "./FoodVerificationDialog";
import { saveFoodEntries } from "./FoodEntrySaver";

interface ImageAnalysisSectionProps {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
  selectedDate: Date;
  onSuccess?: () => void;
}

export const ImageAnalysisSection = ({
  analyzing,
  setAnalyzing,
  nutritionData,
  setNutritionData,
  selectedDate,
  onSuccess,
}: ImageAnalysisSectionProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [mealName, setMealName] = useState("");
  const debouncedImageUrl = useDebounce(imageUrl, 500);

  const handleAnalyzeImage = useCallback(async () => {
    if (!debouncedImageUrl) {
      toast.error("Please enter an image URL");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeImage(debouncedImageUrl);
      if (result && result.foods) {
        setNutritionData(result.foods);
        setMealName(result.meal_name || ""); // Set meal name from AI analysis
      } else {
        toast.error("Could not extract food information from the image.");
        setNutritionData(null);
      }
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  }, [debouncedImageUrl, setAnalyzing, setNutritionData, setMealName]);

  const handleConfirmFoodItems = async (foods: any[]) => {
    try {
      await saveFoodEntries(foods, selectedDate);
      setNutritionData(null);
      setMealName(""); // Reset meal name after saving
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving food entries:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analyze Food from Image</CardTitle>
        <CardDescription>
          Enter an image URL to identify food items and estimate nutrition
          information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Button
            variant="gradient"
            onClick={handleAnalyzeImage}
            disabled={analyzing}
          >
            {analyzing ? "Analyzing..." : "Analyze Image"}
          </Button>
        </div>

        {nutritionData && nutritionData.length > 0 && (
          <FoodVerificationDialog
            isOpen={!!nutritionData}
            onClose={() => setNutritionData(null)}
            foods={nutritionData}
            onConfirm={handleConfirmFoodItems}
            mealName={mealName} // Pass the meal name here
          />
        )}
      </CardContent>
    </Card>
  );
};
