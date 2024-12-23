import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch user's profile data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent food diary entries (last 7 days)
    const { data: foodEntries } = await supabaseClient
      .from('food_diary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false });

    // Calculate average daily nutrition
    const nutritionSummary = foodEntries?.reduce((acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fat += entry.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const daysCount = [...new Set(foodEntries?.map(entry => entry.date))].length || 1;
    Object.keys(nutritionSummary).forEach(key => {
      nutritionSummary[key] = Math.round(nutritionSummary[key] / daysCount);
    });

    // Prepare context for the AI
    const context = `
      User Profile:
      - Current weight: ${profile?.weight_kg}kg
      - Height: ${profile?.height_cm}cm
      - Age: ${profile?.age}
      - Activity level: ${profile?.activity_level}
      - Fitness goals: ${profile?.fitness_goals}
      - Dietary restrictions: ${profile?.dietary_restrictions?.join(', ')}

      Current Targets:
      - Daily calories: ${profile?.target_calories}
      - Daily protein: ${profile?.target_protein}g
      - Daily carbs: ${profile?.target_carbs}g
      - Daily fat: ${profile?.target_fat}g

      7-Day Average Intake:
      - Calories: ${nutritionSummary.calories}
      - Protein: ${nutritionSummary.protein}g
      - Carbs: ${nutritionSummary.carbs}g
      - Fat: ${nutritionSummary.fat}g
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: "You are a knowledgeable and supportive nutrition coach. Analyze the user's data and provide personalized advice. Be concise but friendly. Focus on actionable insights and encouragement. Use the provided context to give specific, data-driven recommendations."
          },
          {
            role: 'user',
            content: `Context about the user:\n${context}\n\nUser message: ${message}`
          }
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});