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
    const usdaApiKey = Deno.env.get('USDA_API_KEY');

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    if (!usdaApiKey) {
      console.error('USDA API key not configured');
      throw new Error('USDA API key not configured');
    }

    if (!image) {
      console.error('No image data received');
      throw new Error('No image data received');
    }

    console.log("Image data received, length:", image.length);

    // First, analyze the image using the vision model
    console.log("Calling OpenAI Vision API...");
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Look at this image of food and return a JSON array. Format: [{\"name\": \"food name\", \"weight_g\": estimated_weight}]. ONLY return the JSON array, no other text. Example: [{\"name\": \"apple\", \"weight_g\": 100}]. Use realistic portion sizes in grams."
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

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error("Vision API Error:", errorData);
      throw new Error(`Vision API request failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const visionData = await visionResponse.json();
    console.log("Vision API response received");
    
    let foodList;
    try {
      const content = visionData.choices[0].message.content.trim();
      console.log("Raw vision content:", content);
      
      const jsonMatch = content.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      foodList = JSON.parse(jsonMatch[0]);
      console.log("Parsed food list:", foodList);
      
      if (!Array.isArray(foodList)) {
        throw new Error('Vision response is not an array');
      }

      foodList.forEach((item: any, index: number) => {
        if (!item.name || typeof item.weight_g !== 'number') {
          throw new Error(`Invalid food item at index ${index}`);
        }
      });

    } catch (parseError) {
      console.error("Error parsing vision response:", parseError);
      console.log("Raw content:", visionData.choices[0].message.content);
      throw new Error('Failed to parse food list from vision response');
    }

    // Now get nutritional information using USDA API
    console.log("Fetching nutrition data from USDA...");
    const nutritionPromises = foodList.map(async (food: any) => {
      const searchResponse = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${usdaApiKey}&query=${encodeURIComponent(food.name)}&dataType=SR Legacy&pageSize=1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error(`USDA API request failed for ${food.name}`);
      }

      const searchData = await searchResponse.json();
      if (!searchData.foods || searchData.foods.length === 0) {
        throw new Error(`No USDA data found for ${food.name}`);
      }

      const usdaFood = searchData.foods[0];
      const getNutrientValue = (nutrientId: number) => {
        const nutrient = usdaFood.foodNutrients.find((n: any) => n.nutrientId === nutrientId);
        return nutrient ? nutrient.value : 0;
      };

      // Convert per 100g values to actual weight
      const weightRatio = food.weight_g / 100;
      const nutrition = {
        calories: Math.round(getNutrientValue(1008) * weightRatio), // Energy (kcal)
        protein: Math.round(getNutrientValue(1003) * weightRatio), // Protein
        carbs: Math.round(getNutrientValue(1005) * weightRatio),   // Carbohydrates
        fat: Math.round(getNutrientValue(1004) * weightRatio),     // Total fat
      };

      return {
        name: food.name,
        weight_g: food.weight_g,
        nutrition
      };
    });

    const foodsWithNutrition = await Promise.all(nutritionPromises);
    console.log("USDA nutrition data fetched successfully");

    return new Response(JSON.stringify({ foods: foodsWithNutrition }), {
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