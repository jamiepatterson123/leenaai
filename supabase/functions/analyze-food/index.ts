
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
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
              model: "gpt-4o",
              temperature: 0.3,
              messages: [
                {
                  role: "system",
                  content: "You are a JSON generator for food items. Output only valid JSON arrays containing food items. No markdown, no text, no explanations."
                },
                {
                  role: "user",
                  content: `Extract food items from this text and return a JSON array like this example (NO OTHER TEXT OR FORMATTING): [{"name":"apple","weight_g":100}]. Text: ${text}`
                }
              ],
            }),
          });

          const completion = await response.json();
          if (!completion.choices?.[0]?.message?.content) {
            throw new Error('No response from OpenAI');
          }

          // Clean and parse the response
          const cleanContent = completion.choices[0].message.content
            .replace(/```json\n?/g, '')
            .replace(/```/g, '')
            .trim();

          console.log('Cleaned content:', cleanContent);
          const foodItems = JSON.parse(cleanContent);

          const foods = await Promise.all(foodItems.map(async (item: any) => {
            const nutritionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: "gpt-4o",
                temperature: 0.3,
                messages: [
                  {
                    role: "system",
                    content: "You are a JSON generator for nutrition facts. Output only valid JSON objects. No markdown, no text, no explanations."
                  },
                  {
                    role: "user",
                    content: `Return nutrition data as a JSON object like this example (NO OTHER TEXT OR FORMATTING): {"calories":50,"protein":0.5,"carbs":12,"fat":0.2}. Food: ${item.weight_g}g of ${item.name}`
                  }
                ],
              }),
            });

            const nutritionCompletion = await nutritionResponse.json();
            const cleanNutritionContent = nutritionCompletion.choices[0]?.message?.content
              .replace(/```json\n?/g, '')
              .replace(/```/g, '')
              .trim();

            console.log('Cleaned nutrition content:', cleanNutritionContent);
            const nutritionData = JSON.parse(cleanNutritionContent || '{}');
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
          
          if (!image.match(/^[A-Za-z0-9+/=]+$/)) {
            throw new Error('Invalid base64 image data');
          }

          const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "gpt-4o",
              temperature: 0.3,
              max_tokens: 1500,
              messages: [
                {
                  role: "system",
                  content: "You're a world-class nutrition coach. Estimate the total calories, macros, and portion sizes in this meal photo. Be specific and detailed. First, describe what foods you see. Then, estimate each component's portion size (e.g., grams or cups), and provide an overall estimate of calories, carbs, protein, and fat. Assume standard preparation unless visible clues suggest otherwise. Use common reference sizes (e.g., plate, spoon) for portion estimation.\n\nIMPORTANT: Overestimate total calories by approximately 5% to ensure we do not under-report for users trying to lose weight. Keep protein, carbs, and fat realistic, and apply the slight calorie buffer to account for hidden oils, sauces, or cooking methods.\n\nAt the end, return the nutritional estimate in this exact JSON format:\n\n{\n  \"calories\": 0,\n  \"protein_g\": 0,\n  \"fat_g\": 0,\n  \"carbs_g\": 0\n}\n\nReplace the zeros with your best estimates. Do not include any extra text after the JSON."
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Analyze this meal photo and provide detailed nutrition estimates following the format specified."
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/jpeg;base64,${image}`
                      }
                    }
                  ]
                }
              ]
            }),
          });

          if (!openAIResponse.ok) {
            const errorData = await openAIResponse.json();
            console.error('OpenAI API error:', errorData);
            throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
          }

          const completion = await openAIResponse.json();
          console.log('Raw OpenAI response:', completion);

          if (!completion.choices?.[0]?.message?.content) {
            throw new Error('Empty response from OpenAI');
          }

          try {
            const content = completion.choices[0].message.content;
            console.log('Full response content:', content);
            
            // Extract JSON from the response - look for the last JSON object
            const jsonMatch = content.match(/\{[^}]*"calories"[^}]*\}/);
            if (!jsonMatch) {
              throw new Error('No nutrition JSON found in response');
            }
            
            const jsonStr = jsonMatch[0];
            console.log('Extracted JSON string:', jsonStr);
            const nutritionData = JSON.parse(jsonStr);

            // Convert to the expected format for the app
            const foods = [{
              name: "Analyzed Meal",
              weight_g: 100, // Default weight, will be adjusted based on actual analysis
              nutrition: {
                calories: nutritionData.calories,
                protein: nutritionData.protein_g,
                carbs: nutritionData.carbs_g,
                fat: nutritionData.fat_g
              }
            }];

            return new Response(
              JSON.stringify({ foods }),
              { headers: corsHeaders }
            );
          } catch (parseError) {
            console.error('Parse error:', parseError);
            console.error('Raw content:', completion.choices[0].message.content);
            throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
          }
        }
      } catch (error) {
        console.error('Error processing input:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to process input', 
            details: error.message,
          }),
          { status: 500, headers: corsHeaders }
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
      { status: 500, headers: corsHeaders }
    );
  }
});
