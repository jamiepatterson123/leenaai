import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USDA_API_KEY = Deno.env.get('USDA_API_KEY');

async function getNutritionFromUSDA(foodName: string, weight_g: number) {
  try {
    console.log(`Getting nutrition for ${foodName} (${weight_g}g) from USDA...`);
    
    // Search for the food item
    const searchResponse = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(foodName)}&pageSize=1`
    );
    
    if (!searchResponse.ok) {
      throw new Error('USDA API search failed');
    }

    const searchData = await searchResponse.json();
    if (!searchData.foods || searchData.foods.length === 0) {
      throw new Error('No matching food found in USDA database');
    }

    const food = searchData.foods[0];
    const nutrients = food.foodNutrients;
    
    // Convert nutrients to our format and scale by weight
    const weightRatio = weight_g / 100; // USDA data is per 100g
    return {
      calories: Math.round((nutrients.find((n: any) => n.nutrientId === 1008)?.value || 0) * weightRatio),
      protein: Math.round((nutrients.find((n: any) => n.nutrientId === 1003)?.value || 0) * weightRatio),
      carbs: Math.round((nutrients.find((n: any) => n.nutrientId === 1005)?.value || 0) * weightRatio),
      fat: Math.round((nutrients.find((n: any) => n.nutrientId === 1004)?.value || 0) * weightRatio),
    };
  } catch (error) {
    console.error('USDA API Error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting analyze-food function");
    
    const { image } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!USDA_API_KEY) {
      throw new Error('USDA API key not configured');
    }

    if (!image) {
      throw new Error('No image data received');
    }

    console.log("Image data received, length:", image.length);

    // First pass: Identify food items
    console.log("First pass: Identifying food items...");
    const identificationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a precise food identification expert. Your task is to identify and separate distinct food items in the image."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "List all distinct food items in this image. Return ONLY a JSON array of objects with 'name' and 'description' fields. Example: [{\"name\": \"chicken breast\", \"description\": \"grilled chicken breast on the left side\"}]."
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
        max_tokens: 300,
      })
    });

    if (!identificationResponse.ok) {
      const errorData = await identificationResponse.json();
      throw new Error(`First pass API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const identificationData = await identificationResponse.json();
    const identifiedItems = JSON.parse(identificationData.choices[0].message.content.match(/\[.*\]/s)[0]);
    console.log("Identified items:", identifiedItems);

    // Second pass: Weight estimation
    console.log("Second pass: Weight estimation...");
    const weightEstimationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "system",
            content: "You are a precise food weight estimation expert. Consider standard portion sizes and visual cues."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze each food item separately: ${JSON.stringify(identifiedItems)}. Return a JSON array matching this format: [{\"name\": \"food name\", \"weight_g\": estimated_weight}].`
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
        max_tokens: 300,
      })
    });

    if (!weightEstimationResponse.ok) {
      const errorData = await weightEstimationResponse.json();
      throw new Error(`Second pass API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const weightEstimationData = await weightEstimationResponse.json();
    let foodList = JSON.parse(weightEstimationData.choices[0].message.content.match(/\[.*\]/s)[0]);
    
    // Apply calibration factor
    foodList = foodList.map((item: any) => ({
      ...item,
      weight_g: Math.round(item.weight_g * 1.1)
    }));

    // Third pass: Get nutrition from USDA
    console.log("Getting nutrition information from USDA...");
    const foodsWithNutrition = await Promise.all(
      foodList.map(async (food: any) => {
        try {
          const nutrition = await getNutritionFromUSDA(food.name, food.weight_g);
          return {
            name: food.name,
            weight_g: food.weight_g,
            nutrition
          };
        } catch (error) {
          console.error(`Error getting nutrition for ${food.name}:`, error);
          // Fallback to estimated values if USDA lookup fails
          return {
            name: food.name,
            weight_g: food.weight_g,
            nutrition: {
              calories: Math.round(food.weight_g * 2), // rough estimate
              protein: Math.round(food.weight_g * 0.2),
              carbs: Math.round(food.weight_g * 0.3),
              fat: Math.round(food.weight_g * 0.1)
            }
          };
        }
      })
    );

    const response = {
      foods: foodsWithNutrition
    };

    console.log("Final output:", response);
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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