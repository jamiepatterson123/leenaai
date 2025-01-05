import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnalyzeImageOptions {
  setNutritionData: (data: any) => void;
  saveFoodEntries: (foods: any[]) => Promise<void>;
}

export const analyzeImage = async (
  image: File,
  { setNutritionData, saveFoodEntries }: AnalyzeImageOptions
) => {
  try {
    console.log("Starting image analysis...");
    
    // Fetch the API key with better error handling
    const { data: secrets, error: secretError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'OpenAI')
      .maybeSingle();

    console.log("API key fetch response:", { 
      hasData: !!secrets, 
      hasError: !!secretError,
      errorMessage: secretError?.message
    });

    if (secretError) {
      console.error('Error fetching API key:', secretError);
      toast.error('Failed to access OpenAI API key. Please check your settings.');
      throw new Error('Failed to access OpenAI API key');
    }

    if (!secrets?.value) {
      console.error('API key not found in secrets');
      toast.error('OpenAI API key not found. Please add it in settings.');
      throw new Error('OpenAI API key not configured');
    }

    const apiKey = secrets.value;
    console.log("Successfully retrieved API key");
    
    // Convert image to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });

    console.log("Image converted to base64, making Vision API call...");

    // First, analyze the image using the vision model
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What food items do you see in this image? Please list them with their approximate portion sizes in grams. Format your response as a simple list of items and weights."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error("Vision API Error:", errorData);
      toast.error(errorData.error?.message || 'Failed to analyze image');
      throw new Error(errorData.error?.message || 'Vision API request failed');
    }

    const visionData = await visionResponse.json();
    const foodList = visionData.choices[0].message.content;
    console.log("Vision analysis result:", foodList);

    // Now get nutritional information using GPT-4
    const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Based on the food items and their portions, provide detailed nutritional information in this exact JSON format, with no additional text or markdown formatting: { \"foods\": [ { \"name\": string, \"weight_g\": number, \"nutrition\": { \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"state\": string } ] }"
          },
          {
            role: "user",
            content: `Please analyze these food items and provide nutritional information: ${foodList}`
          }
        ]
      })
    });

    if (!nutritionResponse.ok) {
      const errorData = await nutritionResponse.json();
      console.error("Nutrition API Error:", errorData);
      toast.error(errorData.error?.message || 'Failed to get nutritional information');
      throw new Error(errorData.error?.message || 'Nutrition API request failed');
    }

    const nutritionData = await nutritionResponse.json();
    console.log("Nutrition analysis result:", nutritionData);

    try {
      const content = nutritionData.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      console.log("Parsed nutrition content:", parsedContent);
      
      if (!parsedContent.foods || !Array.isArray(parsedContent.foods)) {
        throw new Error('Invalid response format: missing foods array');
      }

      setNutritionData(parsedContent);
      return parsedContent;
    } catch (parseError) {
      console.error("Error parsing nutrition response:", parseError);
      toast.error("Error processing the nutritional information");
      throw parseError;
    }
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw error;
  }
};