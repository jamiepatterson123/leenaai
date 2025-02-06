import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const { text, date } = await req.json();
    console.log('Received request:', { text, date });

    if (!text) {
      console.error('No text provided');
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    console.log('Analyzing text with OpenAI...');
    
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

    if (!completion.data.choices[0]?.message?.content) {
      console.error('No response from OpenAI');
      return new Response(
        JSON.stringify({ error: 'Failed to analyze food items' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const foodItems = JSON.parse(completion.data.choices[0].message.content);
    console.log('Extracted food items:', foodItems);

    // Get nutrition information for each food item
    const foods = await Promise.all(foodItems.map(async (item) => {
      console.log(`Getting nutrition for ${item.name}...`);
      
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

      if (!nutritionCompletion.data.choices[0]?.message?.content) {
        console.error(`Failed to get nutrition data for ${item.name}`);
        throw new Error(`Failed to get nutrition data for ${item.name}`);
      }

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
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});