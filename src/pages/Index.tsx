import React, { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { NutritionCard } from "@/components/NutritionCard";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { toast } from "sonner";

const analyzeImage = async (image: File, apiKey: string) => {
  // Convert image to base64
  const base64Image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(image);
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image. Return ONLY a JSON object with this exact format, nothing else: { \"foods\": [ { \"name\": \"food name\", \"weight_g\": estimated_weight_in_grams, \"nutrition\": { \"calories\": number, \"protein\": grams, \"carbs\": grams, \"fat\": grams } } ] }. Be very accurate with food recognition. If you see a whole chicken, don't say it's chicken breast. Estimate portions and nutrition based on standard serving sizes.",
            },
            {
              type: "image_url",
              image_url: {
                "url": `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error analyzing image');
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error parsing GPT response:', data.choices[0].message.content);
    throw new Error('Invalid response format from GPT');
  }
};

const Index = () => {
  const [apiKey, setApiKey] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);

  const handleImageSelect = async (image: File) => {
    if (!apiKey) {
      toast.error("Please set your OpenAI API key first");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeImage(image, apiKey);
      setNutritionData(result);
      toast.success("Food analysis complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error analyzing image");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          Nutrition Tracker
        </h1>
        <ApiKeyInput onApiKeySet={setApiKey} />
        <div className="space-y-8">
          <ImageUpload onImageSelect={handleImageSelect} />
          {analyzing && (
            <p className="text-center text-gray-600 animate-pulse">
              Analyzing your meal...
            </p>
          )}
          {nutritionData && <NutritionCard foods={nutritionData.foods} />}
        </div>
      </div>
    </div>
  );
};

export default Index;