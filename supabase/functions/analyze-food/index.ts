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
            role: "system",
            content: "You are a precise food weight estimation expert. When analyzing food images, pay careful attention to portion sizes and consider these guidelines:\n" +
              "1. A typical chicken breast is 150-400g\n" +
              "2. A typical serving of rice is 150-300g\n" +
              "3. A typical serving of vegetables is 100-200g\n" +
              "Always err on the higher side for protein portions like meat and fish.\n" +
              "Consider the plate size and depth of food for better accuracy."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image and return a JSON array. Format: [{\"name\": \"food name\", \"weight_g\": estimated_weight}]. ONLY return the JSON array, no other text. Be particularly mindful of portion sizes - if you see protein like chicken/fish/meat, remember these are usually 150-400g portions. Use realistic portion sizes in grams."
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
      
      // Apply calibration factor to weights - changed from 1.65 to 1.1
      foodList = foodList.map(item => ({
        ...item,
        weight_g: Math.round(item.weight_g * 1.1) // Calibration factor of 1.1 to adjust for underestimation
      }));

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

    // Now get nutritional information using GPT-4
    console.log("Calling OpenAI for nutrition analysis...");
    const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: "You are a nutrition expert. Return ONLY a JSON object in this format: {\"foods\": [{\"name\": string, \"weight_g\": number, \"nutrition\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}]}. Round all numbers to integers. NO additional text."
          },
          {
            role: "user",
            content: `Calculate nutrition for: ${JSON.stringify(foodList)}`
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

      parsedContent.foods.forEach((food: any, index: number) => {
        if (!food.name || typeof food.weight_g !== 'number' || !food.nutrition) {
          throw new Error(`Invalid food item structure at index ${index}`);
        }
        const { calories, protein, carbs, fat } = food.nutrition;
        if (![calories, protein, carbs, fat].every(n => typeof n === 'number')) {
          throw new Error(`Invalid nutrition values for food item at index ${index}`);
        }
      });

      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Error parsing nutrition response:", parseError);
      console.log("Raw nutrition content:", nutritionData.choices[0].message.content);
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