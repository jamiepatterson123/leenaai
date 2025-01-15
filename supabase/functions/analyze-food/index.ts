import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting analyze-food function");
    
    const { image } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    if (!image) {
      console.error('No image data received');
      throw new Error('No image data received');
    }

    console.log("Image data received, length:", image.length);

    // Single API call for comprehensive analysis
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a comprehensive food analysis system. For each food item in the image:
1. Identify the food and its characteristics
2. Estimate portion size in grams based on visual cues
3. Calculate accurate nutrition information following these guidelines:
- Cross-reference with USDA database values
- Protein guidelines per 100g:
  * Chicken/meat: 25-31g
  * Fish: 20-25g
  * Legumes: 15-20g
- Validation rules:
  * Protein cannot exceed 35g per 100g
  * Total calories must match macros (protein/carbs × 4 + fat × 9)
  * For meat products, protein should be 25-30% of weight
Return a JSON array in this exact format:
{
  "foods": [{
    "name": string,
    "weight_g": number,
    "nutrition": {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  }]
}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image and provide detailed nutritional information for all items."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
      })
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      console.error("API Error:", errorData);
      throw new Error(`API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const analysisData = await analysisResponse.json();
    console.log("Analysis completed");

    try {
      const content = analysisData.choices[0].message.content.trim();
      console.log("Analysis content:", content);
      
      const jsonMatch = content.match(/\{.*\}/s);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      
      const parsedContent = JSON.parse(jsonMatch[0]);
      console.log("Final output:", parsedContent);

      // Validate the nutrition data
      parsedContent.foods = parsedContent.foods.map(food => {
        const { calories, protein, carbs, fat } = food.nutrition;
        const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
        
        // Apply calibration if needed
        if (Math.abs(calculatedCalories - calories) > calories * 0.1) {
          food.nutrition.calories = Math.round(calculatedCalories);
        }
        
        return {
          ...food,
          nutrition: {
            calories: Math.round(food.nutrition.calories),
            protein: Math.round(food.nutrition.protein),
            carbs: Math.round(food.nutrition.carbs),
            fat: Math.round(food.nutrition.fat)
          }
        };
      });
      
      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Error parsing analysis response:", parseError);
      throw new Error('Error processing the nutritional information');
    }
  } catch (error) {
    console.error("Error in analyze-food function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});