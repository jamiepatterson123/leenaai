
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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

    if (req.headers.get('content-type')?.includes('application/json')) {
      const { image, text } = await req.json();
      
      if (!image && !text) {
        console.error('No image or text provided');
        return new Response(
          JSON.stringify({ error: 'No image or text provided' }),
          { status: 400, headers: corsHeaders }
        );
      }

      try {
        if (text) {
          console.log('Processing text input:', text);
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: "You are a nutrition expert. Extract food items and their approximate quantities from the user's input. Return the response as a JSON array with objects containing 'name' and 'weight_g' properties."
                },
                {
                  role: "user",
                  content: text
                }
              ],
            }),
          });

          const completion = await response.json();
          if (!completion.choices?.[0]?.message?.content) {
            throw new Error('No response from OpenAI');
          }

          const foodItems = JSON.parse(completion.choices[0].message.content);
          console.log('Extracted food items:', foodItems);

          const foods = await Promise.all(foodItems.map(async (item: any) => {
            const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: "gpt-4",
                messages: [
                  {
                    role: "system",
                    content: "You are a nutrition expert. Provide accurate nutritional information for the specified food and weight. Return a JSON object with calories, protein (g), carbs (g), and fat (g)."
                  },
                  {
                    role: "user",
                    content: `Provide nutritional information for ${item.weight_g}g of ${item.name}`
                  }
                ],
              }),
            });

            const nutritionCompletion = await nutritionResponse.json();
            const nutritionData = JSON.parse(nutritionCompletion.choices[0]?.message?.content || '{}');
            return {
              ...item,
              nutrition: nutritionData
            };
          }));

          return new Response(
            JSON.stringify({ foods }),
            { headers: corsHeaders }
          );
        }

        if (image) {
          console.log('Processing image input');
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: "You are a nutrition expert. Analyze the food in this image and provide detailed nutritional information. Return a JSON array of food items with their estimated weights and nutritional values."
                },
                {
                  role: "user",
                  content: [
                    { 
                      type: "text", 
                      text: "What foods do you see in this image? List them with approximate quantities in grams and provide nutritional information including calories, protein, carbs, and fat." 
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
            }),
          });

          const completion = await response.json();
          if (!completion.choices?.[0]?.message?.content) {
            throw new Error('No response from OpenAI');
          }

          const foods = JSON.parse(completion.choices[0].message.content);
          console.log('Analysis result:', foods);

          return new Response(
            JSON.stringify({ foods }),
            { headers: corsHeaders }
          );
        }
      } catch (error) {
        console.error('Error processing input:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to process input', 
            details: error.message 
          }),
          { 
            status: 500, 
            headers: corsHeaders 
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in analyze-food function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: corsHeaders 
      }
    );
  }
});
