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
            role: "user",
            content: [
              {
                type: "text",
                text: "What food items do you see in this image? Please list them with their approximate portion sizes in grams. Format your response as a simple list of items and weights."
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
            content: "You are a nutrition expert. Based on the food items and their portions, provide detailed nutritional information in this exact JSON format, with no additional text or markdown formatting: { \"foods\": [ { \"name\": string, \"weight_g\": number, \"nutrition\": { \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }, \"state\": string } ] }"
          },
          {
            role: "user",
            content: `Please analyze these food items and provide nutritional information: ${foodList}`
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