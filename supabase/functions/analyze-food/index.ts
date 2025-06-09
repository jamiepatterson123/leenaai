
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
      const { images, image, text } = await req.json();
      
      // Support both single image (legacy) and multiple images
      const imageList = images || (image ? [image] : []);
      
      if (!imageList.length && !text) {
        return new Response(
          JSON.stringify({ error: 'No images or text provided' }),
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

        if (imageList.length > 0) {
          console.log(`Processing ${imageList.length} image(s)`);
          
          // Validate all images
          for (let i = 0; i < imageList.length; i++) {
            if (!imageList[i].match(/^[A-Za-z0-9+/=]+$/)) {
              throw new Error(`Invalid base64 image data for image ${i + 1}`);
            }
          }

          // Create content array with multiple images
          const content = [
            {
              type: "text",
              text: imageList.length > 1 
                ? `Analyze these ${imageList.length} images of the same meal taken from different angles. Use the multiple perspectives to get more accurate volume estimates and identify food items more precisely. Provide detailed nutrition estimates for each item separately.`
                : "Identify each individual food item in this image and provide detailed nutrition estimates for each item separately."
            }
          ];

          // Add all images to the content
          imageList.forEach((imageData: string, index: number) => {
            content.push({
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageData}`
              }
            });
          });

          const systemPrompt = imageList.length > 1
            ? `You are a nutrition expert analyzing multiple images of the same meal from different angles. Use the multiple perspectives to:

1. Get more accurate volume estimates by comparing angles
2. Identify foods that might be hidden in single views
3. Better estimate portion sizes using visual references across angles
4. Provide higher confidence in your analysis

IMPORTANT WEIGHT GUIDELINES: With multiple angles, provide more precise weight estimates. Use specific numbers like 127g, 283g, 157g, 91g instead of rounded numbers. The multiple views should allow for better accuracy.

NUTRITION GUIDELINES: Provide all nutrition values (calories, protein, carbs, fat) as whole numbers without decimals.

Return your response as a JSON array containing objects for each food item you identify. Each object should have this exact structure:
{"name": "Specific food name with cooking method", "weight_g": estimated_weight_in_grams, "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number}, "confidence": confidence_level_0_to_1}

Be specific with food names (e.g., "Grilled Ribeye Steak" not just "steak"). With multiple angles, you can be more confident in weights and identification. Apply a 5% calorie buffer for hidden fats/oils. Return ONLY the JSON array, no other text.`
            : `You are a nutrition expert who identifies individual food items in images. Analyze the image and identify each distinct food item visible. For each item, estimate its specific weight and provide detailed nutrition information.

IMPORTANT WEIGHT GUIDELINES: Provide realistic, non-rounded weights that convey precision. Use specific numbers like 127g, 283g, 157g, 91g instead of rounded numbers like 130g, 300g, 150g, 90g. Weights should vary naturally and not frequently end in 0 or 5.

NUTRITION GUIDELINES: Provide all nutrition values (calories, protein, carbs, fat) as whole numbers without decimals.

Return your response as a JSON array containing objects for each food item you identify. Each object should have this exact structure:
{"name": "Specific food name with cooking method", "weight_g": estimated_weight_in_grams, "nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number}, "confidence": confidence_level_0_to_1}

Be specific with food names (e.g., "Grilled Ribeye Steak" not just "steak"). Estimate weights based on visual cues like plate size, utensils, and portion appearance. Apply a 5% calorie buffer for hidden fats/oils. Return ONLY the JSON array, no other text.`;

          const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: "gpt-4o",
              temperature: 0.3,
              max_tokens: 2000,
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: content
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
            
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
              throw new Error('No JSON array found in response');
            }
            
            const jsonStr = jsonMatch[0];
            console.log('Extracted JSON string:', jsonStr);
            const foods = JSON.parse(jsonStr);

            if (!Array.isArray(foods) || foods.length === 0) {
              throw new Error('Invalid foods array in response');
            }

            const validatedFoods = foods.map(food => ({
              name: food.name || 'Unknown Food',
              weight_g: food.weight_g || 100,
              nutrition: {
                calories: food.nutrition?.calories || 0,
                protein: food.nutrition?.protein || 0,
                carbs: food.nutrition?.carbs || 0,
                fat: food.nutrition?.fat || 0
              },
              confidence: food.confidence || 0.7
            }));

            return new Response(
              JSON.stringify({ 
                foods: validatedFoods,
                multi_angle: imageList.length > 1,
                image_count: imageList.length
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
