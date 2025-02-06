import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, date } = await req.json();
    console.log('Received request with:', { text, date });

    if (!text) {
      throw new Error('No text provided');
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    console.log('Analyzing text with OpenAI...');
    
    // First, extract food items and quantities
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract food items and their approximate quantities from this text. Format the response as a JSON array of objects with these properties:
          - name: food name
          - weight_g: estimated weight in grams
          - category: meal category (breakfast, lunch, dinner, or snacks)
          Example: [{"name": "banana", "weight_g": 120, "category": "snacks"}]`
        },
        { role: "user", content: text }
      ],
    });

    const foodItems = JSON.parse(completion.data.choices[0].message.content);
    console.log('Extracted food items:', foodItems);

    // Then, get nutrition information for each food
    const foods = await Promise.all(foodItems.map(async (item) => {
      const nutritionCompletion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Provide accurate nutritional information for the specified food quantity."
          },
          {
            role: "user",
            content: `Provide nutritional information for ${item.weight_g}g of ${item.name} in this exact JSON format:
            {
              "calories": number,
              "protein": number of grams,
              "carbs": number of grams,
              "fat": number of grams
            }`
          }
        ],
      });

      const nutrition = JSON.parse(nutritionCompletion.data.choices[0].message.content);
      console.log(`Nutrition data for ${item.name}:`, nutrition);

      return {
        name: item.name,
        weight_g: item.weight_g,
        category: item.category,
        nutrition,
        state: 'raw'
      };
    }));

    console.log('Processed all foods:', foods);

    return new Response(
      JSON.stringify({ foods }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});