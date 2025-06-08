
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();

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
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Fetch recent weight history (last 30 days)
    const { data: weightHistory } = await supabaseClient
      .from('weight_history')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false });

    // Calculate daily nutrition totals for the last 7 days
    const dailyTotals = calculateDailyNutritionTotals(foodEntries || []);
    
    // Get today's nutrition totals
    const today = new Date().toISOString().split('T')[0];
    const todaysTotals = dailyTotals[today] || { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Calculate recent weight trend
    const weightTrend = calculateWeightTrend(weightHistory || []);

    // Prepare nutrition context for the AI
    const nutritionContext = `
      User's Nutrition Profile:
      ${profile ? `
        - Target Calories: ${profile.target_calories || 'Not set'} kcal/day
        - Target Protein: ${profile.target_protein || 'Not set'}g/day
        - Target Carbs: ${profile.target_carbs || 'Not set'}g/day
        - Target Fat: ${profile.target_fat || 'Not set'}g/day
        - Age: ${profile.age || 'Not provided'}
        - Weight: ${profile.weight_kg || 'Not provided'}kg
        - Height: ${profile.height_cm || 'Not provided'}cm
        - Fitness Goals: ${profile.fitness_goals || 'Not specified'}
        - Activity Level: ${profile.activity_level || 'Not specified'}
        - Dietary Restrictions: ${profile.dietary_restrictions?.join(', ') || 'None specified'}
      ` : 'Profile not available'}

      Today's Nutrition Progress:
      - Calories: ${todaysTotals.calories}/${profile?.target_calories || 'target not set'} kcal (${profile?.target_calories ? Math.round((todaysTotals.calories / profile.target_calories) * 100) : 0}%)
      - Protein: ${todaysTotals.protein.toFixed(1)}/${profile?.target_protein || 'target not set'}g (${profile?.target_protein ? Math.round((todaysTotals.protein / profile.target_protein) * 100) : 0}%)
      - Carbs: ${todaysTotals.carbs.toFixed(1)}/${profile?.target_carbs || 'target not set'}g (${profile?.target_carbs ? Math.round((todaysTotals.carbs / profile.target_carbs) * 100) : 0}%)
      - Fat: ${todaysTotals.fat.toFixed(1)}/${profile?.target_fat || 'target not set'}g (${profile?.target_fat ? Math.round((todaysTotals.fat / profile.target_fat) * 100) : 0}%)

      Recent Food History (Last 7 days):
      ${formatRecentMeals(foodEntries || [])}

      Weight Tracking:
      ${weightTrend.length > 0 ? `
        - Current Weight: ${weightTrend[0]?.weight_kg}kg (${new Date(weightTrend[0]?.recorded_at).toLocaleDateString()})
        - Weight Trend (30 days): ${calculateWeightChange(weightTrend)}
      ` : 'No recent weight data available'}

      Daily Nutrition Summary (Last 7 days):
      ${formatDailyNutritionSummary(dailyTotals, profile)}
    `;

    // Call OpenAI API with nutrition-focused context
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
            content: "You are Leena.ai, a specialized nutrition coach and food expert. Your role is to help users achieve their nutrition and weight goals through personalized dietary advice. Focus on meal planning, macro balance, food choices, portion sizes, and eating patterns. Analyze their current nutrition intake against their targets and provide actionable advice. Be encouraging, specific, and practical in your recommendations. When discussing food, mention specific foods, recipes, or meal ideas that would help them meet their goals."
          },
          {
            role: 'user',
            content: `Here's my current nutrition data:\n${nutritionContext}\n\nUser message: ${message}`
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

function calculateDailyNutritionTotals(foodEntries: any[]) {
  const dailyTotals: { [date: string]: { calories: number; protein: number; carbs: number; fat: number } } = {};
  
  foodEntries.forEach(entry => {
    const date = entry.date;
    if (!dailyTotals[date]) {
      dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    dailyTotals[date].calories += Number(entry.calories) || 0;
    dailyTotals[date].protein += Number(entry.protein) || 0;
    dailyTotals[date].carbs += Number(entry.carbs) || 0;
    dailyTotals[date].fat += Number(entry.fat) || 0;
  });
  
  return dailyTotals;
}

function formatRecentMeals(foodEntries: any[]) {
  if (!foodEntries || foodEntries.length === 0) return 'No recent meals logged';
  
  const recentMeals = foodEntries.slice(0, 10); // Show last 10 entries
  return recentMeals.map(entry => 
    `- ${entry.food_name} (${entry.weight_g}g): ${entry.calories} kcal, ${entry.protein}g protein, ${entry.carbs}g carbs, ${entry.fat}g fat - ${new Date(entry.date).toLocaleDateString()}`
  ).join('\n');
}

function calculateWeightTrend(weightHistory: any[]) {
  return weightHistory.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
}

function calculateWeightChange(weightTrend: any[]) {
  if (weightTrend.length < 2) return 'Insufficient data for trend analysis';
  
  const latest = weightTrend[0];
  const oldest = weightTrend[weightTrend.length - 1];
  const change = Number(latest.weight_kg) - Number(oldest.weight_kg);
  const days = Math.ceil((new Date(latest.recorded_at).getTime() - new Date(oldest.recorded_at).getTime()) / (1000 * 60 * 60 * 24));
  
  if (change > 0) {
    return `+${change.toFixed(1)}kg over ${days} days`;
  } else if (change < 0) {
    return `${change.toFixed(1)}kg over ${days} days`;
  } else {
    return `No change over ${days} days`;
  }
}

function formatDailyNutritionSummary(dailyTotals: any, profile: any) {
  const dates = Object.keys(dailyTotals).sort().reverse().slice(0, 7);
  
  if (dates.length === 0) return 'No nutrition data available for the past week';
  
  return dates.map(date => {
    const totals = dailyTotals[date];
    const calTarget = profile?.target_calories || 2000;
    const calPercent = Math.round((totals.calories / calTarget) * 100);
    
    return `- ${new Date(date).toLocaleDateString()}: ${totals.calories} kcal (${calPercent}% of target), ${totals.protein.toFixed(1)}g protein, ${totals.carbs.toFixed(1)}g carbs, ${totals.fat.toFixed(1)}g fat`;
  }).join('\n');
}
