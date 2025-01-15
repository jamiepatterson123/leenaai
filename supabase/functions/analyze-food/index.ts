import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting image analysis...");
    
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

    // First, analyze the image using the vision model
    console.log("Calling OpenAI Vision API...");
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a precise food weight estimation expert. When analyzing food images, pay careful attention to portion sizes and consider these guidelines:\n" +
              "1. For meal prep labels: If you see a nutrition label with food name and macros, extract and return those exact values\n" +
              "2. A typical chicken breast is 150-400g\n" +
              "3. A typical serving of rice is 150-300g\n" +
              "4. A typical serving of vegetables is 100-200g\n" +
              "Consider the plate size and depth of food for better accuracy."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image and return a JSON array. If it's a meal prep label, extract the exact values shown. Format: [{\"name\": \"food name\", \"weight_g\": estimated_weight, \"nutrition\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}]. If it's a meal prep label with nutrition info, include the nutrition object. For regular food photos, omit the nutrition object. ONLY return the JSON array, no other text."
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
      
      // Apply calibration factor to weights
      foodList = foodList.map(item => ({
        ...item,
        weight_g: Math.round(item.weight_g * 1.1) // Calibration factor of 1.1
      }));

      if (!Array.isArray(foodList)) {
        throw new Error('Vision response is not an array');
      }

      // Validate the structure of each food item
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

    // Check if all items already have nutrition information (from meal prep labels)
    const needsNutritionInfo = foodList.some(item => !item.nutrition);

    if (needsNutritionInfo) {
      // Only make the second API call if we need nutrition information
      console.log("Some items need nutrition info, calling OpenAI for nutrition analysis...");
      const nutritionPrompt = foodList
        .filter(item => !item.nutrition)
        .map(item => `${item.weight_g}g of ${item.name}`)
        .join(", ");

      const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a nutrition expert. Provide accurate nutritional information for the specified food and weight."
            },
            {
              role: "user",
              content: `Calculate precise nutrition for: ${nutritionPrompt}. Return in JSON format: {"foods": [{"name": string, "weight_g": number, "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number}}]}. ONLY return the JSON object, no other text.`
            }
          ],
        })
      });

      if (!nutritionResponse.ok) {
        const errorData = await nutritionResponse.json();
        console.error("Nutrition API Error:", errorData);
        throw new Error(`Nutrition API request failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const nutritionData = await nutritionResponse.json();
      console.log("Nutrition analysis response received");

      try {
        const content = nutritionData.choices[0].message.content.trim();
        console.log("Raw nutrition content:", content);
        
        const jsonMatch = content.match(/\{.*\}/s);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        
        const parsedContent = JSON.parse(jsonMatch[0]);
        console.log("Parsed nutrition content:", parsedContent);
        
        if (!parsedContent.foods || !Array.isArray(parsedContent.foods)) {
          throw new Error('Invalid response format: missing foods array');
        }

        // Merge nutrition data with existing food list
        foodList = foodList.map(item => {
          if (item.nutrition) return item; // Keep existing nutrition data
          const nutritionItem = parsedContent.foods.find(f => f.name.toLowerCase() === item.name.toLowerCase());
          return nutritionItem || item;
        });
      } catch (parseError) {
        console.error("Error parsing nutrition response:", parseError);
        throw new Error('Error processing the nutritional information');
      }
    } else {
      console.log("All items have nutrition info from labels, skipping nutrition API call");
    }

    return new Response(JSON.stringify({ foods: foodList }), {
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