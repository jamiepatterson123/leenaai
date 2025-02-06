import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    // For image analysis
    if (req.headers.get('content-type')?.includes('application/json')) {
      const { image, text, date } = await req.json();
      
      if (!image && !text) {
        console.error('No image or text provided');
        return new Response(
          JSON.stringify({ error: 'No image or text provided' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const configuration = new Configuration({ apiKey });
      const openai = new OpenAIApi(configuration);

      // Handle text-based input
      if (text) {
        console.log('Processing text input:', text);
        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a nutrition expert. Extract food items and their approximate quantities from the user's input."
            },
            {
              role: "user",
              content: text
            }
          ]
        });

        if (!completion.data.choices[0]?.message?.content) {
          throw new Error('No response from OpenAI');
        }

        const foodItems = JSON.parse(completion.data.choices[0].message.content);
        console.log('Extracted food items:', foodItems);

        const foods = await Promise.all(foodItems.map(async (item: any) => {
          const nutritionCompletion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a nutrition expert. Provide accurate nutritional information for the specified food and weight."
              },
              {
                role: "user",
                content: `Provide nutritional information for ${item.weight_g}g of ${item.name} in JSON format with calories, protein, carbs, and fat.`
              }
            ]
          });

          const nutritionData = JSON.parse(nutritionCompletion.data.choices[0]?.message?.content || '{}');
          return {
            ...item,
            ...nutritionData
          };
        }));

        return new Response(
          JSON.stringify({ foods }),
          { headers: corsHeaders }
        );
      }

      // Handle image analysis
      if (image) {
        console.log('Processing image input');
        const completion = await openai.createChatCompletion({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "system",
              content: "You are a nutrition expert. Analyze the food in this image and provide detailed nutritional information."
            },
            {
              role: "user",
              content: [
                { type: "text", text: "What foods do you see in this image? List them with approximate quantities in grams." },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } }
              ]
            }
          ]
        });

        const foods = JSON.parse(completion.data.choices[0]?.message?.content || '[]');
        return new Response(
          JSON.stringify({ foods }),
          { headers: corsHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});