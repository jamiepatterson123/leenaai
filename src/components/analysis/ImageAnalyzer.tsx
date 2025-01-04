import { toast } from "sonner";

interface AnalyzeImageOptions {
  apiKey: string;
  setNutritionData: (data: any) => void;
  saveFoodEntries: (foods: any[]) => Promise<void>;
}

export const analyzeImage = async (
  image: File,
  { apiKey, setNutritionData, saveFoodEntries }: AnalyzeImageOptions
) => {
  try {
    console.log("Starting image analysis...");
    
    // Convert image to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract the base64 data after the data URL prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });

    console.log("Image converted to base64, making API call...");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Analyze the food in the image and provide detailed nutritional information in a structured JSON format. Include calories, protein, carbs, and fat content. If multiple foods are present, list them separately."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What food items do you see in this image? Please provide nutritional information for each item."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      
      if (response.status === 429) {
        toast.error("API quota exceeded. Please check your OpenAI account.");
      } else {
        toast.error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from API');
    }

    const content = data.choices[0].message.content;
    console.log("Response content:", content);

    try {
      const parsedContent = JSON.parse(content);
      console.log("Parsed content:", parsedContent);
      
      if (!parsedContent.foods || !Array.isArray(parsedContent.foods)) {
        throw new Error('Invalid response format: missing foods array');
      }

      setNutritionData(parsedContent);
      return parsedContent;
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      toast.error("Error processing the response from OpenAI");
      throw parseError;
    }
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw error;
  }
};