
import React, { useState, useCallback, forwardRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { FoodVerificationDialog } from "./FoodVerificationDialog";
import { saveFoodEntries } from "./FoodEntrySaver";
import { analyzeImage } from "./ImageAnalyzer";

interface ImageAnalysisSectionProps {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  nutritionData: any;
  setNutritionData: (data: any) => void;
  selectedDate: Date;
  onSuccess?: () => void;
}

export const ImageAnalysisSection = forwardRef<HTMLDivElement, ImageAnalysisSectionProps>(({
  analyzing,
  setAnalyzing,
  nutritionData,
  setNutritionData,
  selectedDate,
  onSuccess,
}, ref) => {
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
      // We're using a mock here since we don't have the actual image analysis logic
      // In a real app, this would use the URL to fetch an image and analyze it
      const result = {
        foods: [
          {
            name: "Apple",
            weight_g: 100,
            nutrition: {
              calories: 52,
              protein: 0.3,
              carbs: 14,
              fat: 0.2
            },
            state: "raw"
          }
        ],
        meal_name: "Snack"
      };
      
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
  }, [debouncedImageUrl, setAnalyzing, setNutritionData]);

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
      toast.error("Failed to save food entries");
    }
  };

  return (
    <Card className="w-full" ref={ref}>
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
});

ImageAnalysisSection.displayName = "ImageAnalysisSection";
