import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, date } = await req.json();

    if (!text) {
      throw new Error('Text input is required');
    }

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    const prompt = `Extract food items and their approximate quantities from this text: "${text}"
    Format the response as a JSON array of objects with these properties:
    - name: food name
    - weight_g: estimated weight in grams
    - category: meal category (breakfast, lunch, dinner, or snacks)
    Example: [{"name": "banana", "weight_g": 120, "category": "snacks"}]`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a nutrition expert that extracts food information from natural language." },
        { role: "user", content: prompt }
      ],
    });

    const foodItems = JSON.parse(completion.data.choices[0].message.content);

    // Now get nutrition information for each food item
    const foods = await Promise.all(foodItems.map(async (item) => {
      const nutritionPrompt = `Provide nutritional information for ${item.weight_g}g of ${item.name} in this exact JSON format:
      {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      }`;

      const nutritionCompletion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a nutrition expert." },
          { role: "user", content: nutritionPrompt }
        ],
      });

      const nutrition = JSON.parse(nutritionCompletion.data.choices[0].message.content);
      
      return {
        name: item.name,
        weight_g: item.weight_g,
        category: item.category,
        nutrition
      };
    }));

    return new Response(
      JSON.stringify({ foods }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});