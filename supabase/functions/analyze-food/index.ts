
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
          // First get food items
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

          // Get the meal name
          const mealNameResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  content: "You are a culinary expert that creates descriptive and standard names for meals. Use restaurant menu naming conventions. Focus on the main dish components when naming."
                },
                {
                  role: "user",
                  content: `Based on these food items ${JSON.stringify(foodItems.map((f: any) => f.name))}, provide a proper meal name that would appear on a restaurant menu. Return ONLY the name as plain text without quotes or additional text.`
                }
              ],
            }),
          });

          const mealNameCompletion = await mealNameResponse.json();
          const mealName = mealNameCompletion.choices[0]?.message?.content.trim();
          
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
            JSON.stringify({ 
              foods,
              meal_name: mealName
            }),
            { headers: corsHeaders }
          );
        }

        if (image) {
          console.log('Processing image input');
          
          if (!image.match(/^[A-Za-z0-9+/=]+$/)) {
            throw new Error('Invalid base64 image data');
          }

          // First analyze the image for foods
          const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "gpt-4o",
              temperature: 0.3,
              max_tokens: 1000,
              messages: [
                {
                  role: "system",
                  content: "You are a JSON generator for food analysis. Output only valid JSON arrays with food items and their nutrition data. No markdown, no text, no explanations."
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Return a JSON array like this example (NO OTHER TEXT OR FORMATTING): [{\"name\":\"food name\",\"weight_g\":100,\"nutrition\":{\"calories\":50,\"protein\":0.5,\"carbs\":12,\"fat\":0.2}}]"
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
            const cleanContent = completion.choices[0].message.content
              .replace(/```json\n?/g, '')
              .replace(/```/g, '')
              .trim();
            
            console.log('Cleaned content:', cleanContent);
            const parsedContent = JSON.parse(cleanContent);

            if (!Array.isArray(parsedContent)) {
              throw new Error('Response is not an array');
            }

            parsedContent.forEach((item, index) => {
              if (!item.name || typeof item.weight_g !== 'number' || !item.nutrition) {
                throw new Error(`Invalid food item structure at index ${index}`);
              }
            });

            // Now get the meal name
            const mealNameResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                    content: "You are a culinary expert that creates descriptive and standard names for meals. Use restaurant menu naming conventions. Focus on the main dish components when naming."
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "Look at this meal and provide a proper name that would appear on a restaurant menu. Return ONLY the name as plain text without quotes or additional text."
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

            const mealNameCompletion = await mealNameResponse.json();
            const mealName = mealNameCompletion.choices[0]?.message?.content.trim();

            return new Response(
              JSON.stringify({ 
                foods: parsedContent,
                meal_name: mealName
              }),
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
