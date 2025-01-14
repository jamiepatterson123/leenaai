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
            content: "You are a nutrition expert that breaks down meals into their individual components. For composite meals, separate each ingredient and estimate their individual weights and nutritional content. Always return multiple food items unless it's a single ingredient food."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image. If it's a nutrition label, extract the information. If it's a prepared meal or dish, break it down into its main components (e.g., 'Chicken Pesto Pasta' should be broken down into 'Grilled Chicken', 'Pasta', and 'Pesto Sauce' with estimated weights). Return ONLY the nutritional information in this exact JSON format: {\"foods\": [{\"name\": \"Item Name\", \"weight_g\": portion_in_grams, \"nutrition\": {\"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}}]}. For food images, use realistic portion sizes in grams. ONLY return the JSON array, no other text."
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
      
      // Try to extract JSON if there's any extra text
      const jsonMatch = content.match(/\{.*\}/s);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      
      foodList = JSON.parse(jsonMatch[0]);
      console.log("Parsed food list:", foodList);
      
      if (!foodList.foods || !Array.isArray(foodList.foods)) {
        throw new Error('Invalid response format: missing foods array');
      }

      // Validate the structure of each food item
      foodList.foods.forEach((food: any, index: number) => {
        if (!food.name || typeof food.weight_g !== 'number' || !food.nutrition) {
          throw new Error(`Invalid food item structure at index ${index}`);
        }
        const { calories, protein, carbs, fat } = food.nutrition;
        if (![calories, protein, carbs, fat].every(n => typeof n === 'number')) {
          throw new Error(`Invalid nutrition values for food item at index ${index}`);
        }
      });

      return new Response(JSON.stringify(foodList), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Error parsing vision response:", parseError);
      console.log("Raw content:", visionData.choices[0].message.content);
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