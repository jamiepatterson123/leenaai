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
    const { image } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // First, analyze the image using the vision model
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
            content: "You are a precise nutrition expert focused on accurate food identification and portion estimation. Use standard serving sizes and USDA database values for consistency."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image. List each visible food item with its estimated weight in grams. Consider visible portion sizes, standard servings, and common plating. Be precise but concise."
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
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a nutrition database expert. Use USDA standard values and provide precise nutritional calculations based on given weights. Round to nearest whole number for clarity."
          },
          {
            role: "user",
            content: `Calculate accurate nutritional values for these items using USDA database values: ${foodList}. Respond only with the JSON array, no explanations.`
          }
        ],
      })
    });

    if (!nutritionResponse.ok) {
      const errorData = await nutritionResponse.json();
      console.error("Nutrition API Error:", errorData);
      throw new Error(errorData.error?.message || 'Nutrition API request failed');
    }

    const nutritionData = await nutritionResponse.json();
    console.log("Nutrition analysis result:", nutritionData);

    try {
      const content = nutritionData.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      console.log("Parsed nutrition content:", parsedContent);
      
      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error("Error parsing nutrition response:", parseError);
      throw new Error('Error processing the nutritional information');
    }
  } catch (error) {
    console.error("Error in analyze-food function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});