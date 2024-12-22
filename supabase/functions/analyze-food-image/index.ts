import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, userId } = await req.json();

    // Call OpenAI API to analyze the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Analyze the food image and provide detailed nutritional information in JSON format with these fields: food_name (string), weight_g (number), calories (number), protein (number), carbs (number), fat (number). Estimate portions if needed."
          },
          {
            role: "user",
            content: [
              {
                type: "image",
                image_url: image
              },
              {
                type: "text",
                text: "What food is in this image? Please provide nutritional information."
              }
            ]
          }
        ]
      }),
    });

    const aiData = await response.json();
    const nutritionInfo = JSON.parse(aiData.choices[0].message.content);

    // Insert into food diary
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('food_diary')
      .insert({
        user_id: userId,
        food_name: nutritionInfo.food_name,
        weight_g: nutritionInfo.weight_g,
        calories: nutritionInfo.calories,
        protein: nutritionInfo.protein,
        carbs: nutritionInfo.carbs,
        fat: nutritionInfo.fat,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, entry: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});