
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
    const { message, userId, conversationHistory = [] } = await req.json();

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

    // Get current date in YYYY-MM-DD format (UTC)
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log('Fetching food entries for userId:', userId);
    console.log('Today date:', today);
    console.log('Thirty days ago:', thirtyDaysAgo);

    // Fetch food diary entries (last 30 days for comprehensive analysis)
    const { data: foodEntries, error: foodError } = await supabaseClient
      .from('food_diary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: false });

    if (foodError) {
      console.error('Error fetching food entries:', foodError);
    } else {
      console.log('Found food entries:', foodEntries?.length || 0);
      console.log('Today entries:', foodEntries?.filter(entry => entry.date === today).length || 0);
    }

    // Fetch weight history (last 90 days for trend analysis)
    const { data: weightHistory } = await supabaseClient
      .from('weight_history')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false });

    // Calculate simplified nutrition analysis for custom GPT
    const nutritionAnalysis = calculateSimplifiedNutritionAnalysis(foodEntries || [], profile);
    const goalAnalysis = analyzeGoalProgress(profile, nutritionAnalysis, weightHistory || []);

    // Build simplified context for custom GPT
    const nutritionContext = buildSimplifiedContext(
      profile,
      nutritionAnalysis,
      goalAnalysis,
      weightHistory || [],
      today
    );

    // Build messages array with conversation history
    const messages = [
      {
        role: 'user',
        content: conversationHistory && conversationHistory.length > 0 
          ? `Previous conversation context:\n${nutritionContext}\n\nContinuing our conversation:\n${message}`
          : `Here's my current nutrition data:\n${nutritionContext}\n\nUser message: ${message}`
      }
    ];

    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      // Add the last 6 exchanges (12 messages) for context
      const recentHistory = conversationHistory.slice(-12);
      recentHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Add current user message
      messages.push({
        role: 'user',
        content: message
      });
    }

    // Call your custom GPT via OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        // Add custom GPT configuration
        tools: [{
          type: 'function',
          function: {
            name: 'leena_ai_coach',
            description: 'Leena.ai personalized nutrition coaching',
            parameters: {
              type: 'object',
              properties: {
                user_data: {
                  type: 'string',
                  description: 'User nutrition and profile data'
                },
                message: {
                  type: 'string', 
                  description: 'User message or question'
                }
              }
            }
          }
        }],
        tool_choice: {
          type: 'function',
          function: { name: 'leena_ai_coach' }
        }
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content || 
                      data.choices[0].message.tool_calls?.[0]?.function?.arguments ||
                      "I'm here to help with your nutrition goals. Could you tell me more about what you'd like assistance with?";

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

function calculateSimplifiedNutritionAnalysis(foodEntries: any[], profile: any) {
  const dailyTotals: { [date: string]: { calories: number; protein: number; carbs: number; fat: number; meals: number } } = {};
  
  const now = new Date();
  const last7DaysDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30DaysDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  foodEntries.forEach(entry => {
    const date = entry.date;
    
    if (!dailyTotals[date]) {
      dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
    }
    
    dailyTotals[date].calories += Number(entry.calories) || 0;
    dailyTotals[date].protein += Number(entry.protein) || 0;
    dailyTotals[date].carbs += Number(entry.carbs) || 0;
    dailyTotals[date].fat += Number(entry.fat) || 0;
    dailyTotals[date].meals += 1;
  });
  
  // Calculate 7-day and 30-day averages
  const dates = Object.keys(dailyTotals);
  const last7Days = dates.filter(date => new Date(date) >= last7DaysDate);
  const last30Days = dates.filter(date => new Date(date) >= last30DaysDate);
  
  const calculateAverage = (days: string[]) => {
    if (days.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const totals = days.reduce((acc, date) => {
      acc.calories += dailyTotals[date].calories;
      acc.protein += dailyTotals[date].protein;
      acc.carbs += dailyTotals[date].carbs;
      acc.fat += dailyTotals[date].fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return {
      calories: Math.round(totals.calories / days.length),
      protein: Math.round(totals.protein / days.length),
      carbs: Math.round(totals.carbs / days.length),
      fat: Math.round(totals.fat / days.length)
    };
  };
  
  return {
    dailyTotals,
    averages7Day: calculateAverage(last7Days),
    averages30Day: calculateAverage(last30Days),
    consistency: calculateConsistency(dailyTotals, profile)
  };
}

function calculateConsistency(dailyTotals: any, profile: any) {
  const dates = Object.keys(dailyTotals);
  if (dates.length === 0) return { overall: 0 };
  
  const targets = {
    calories: profile?.target_calories || 2000,
    protein: profile?.target_protein || 150,
    carbs: profile?.target_carbs || 200,
    fat: profile?.target_fat || 70
  };
  
  const adherenceScores = dates.map(date => {
    const day = dailyTotals[date];
    const calorieAdherence = Math.min(day.calories / targets.calories, 1.5);
    const proteinAdherence = Math.min(day.protein / targets.protein, 1.5);
    const carbsAdherence = Math.min(day.carbs / targets.carbs, 1.5);
    const fatAdherence = Math.min(day.fat / targets.fat, 1.5);
    
    return (calorieAdherence + proteinAdherence + carbsAdherence + fatAdherence) / 4;
  });
  
  const overall = Math.round((adherenceScores.reduce((sum, score) => sum + score, 0) / dates.length) * 100);
  
  return { overall };
}

function analyzeGoalProgress(profile: any, nutritionAnalysis: any, weightHistory: any[]) {
  const fitnessGoal = profile?.fitness_goals || 'maintenance';
  const targetCalories = profile?.target_calories || 2000;
  const averageCalories = nutritionAnalysis.averages30Day.calories;
  
  let goalStatus = 'on_track';
  let calorieDeviation = averageCalories - targetCalories;
  
  // Analyze based on fitness goals
  if (fitnessGoal === 'weight_loss' && averageCalories > targetCalories) {
    goalStatus = 'above_target';
  } else if (fitnessGoal === 'muscle_gain' && averageCalories < targetCalories) {
    goalStatus = 'below_target';
  } else if (Math.abs(calorieDeviation) > targetCalories * 0.15) {
    goalStatus = 'off_target';
  }
  
  // Weight trend analysis
  const weightTrend = analyzeWeightTrend(weightHistory);
  
  return {
    fitnessGoal,
    goalStatus,
    calorieDeviation,
    weightTrend
  };
}

function analyzeWeightTrend(weightHistory: any[]) {
  if (weightHistory.length < 2) return { description: 'insufficient_data', weeklyRate: 0 };
  
  const sortedHistory = weightHistory.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const latest = sortedHistory[sortedHistory.length - 1];
  const earliest = sortedHistory[0];
  
  const weightChange = Number(latest.weight_kg) - Number(earliest.weight_kg);
  const daysDiff = Math.ceil((new Date(latest.recorded_at).getTime() - new Date(earliest.recorded_at).getTime()) / (1000 * 60 * 60 * 24));
  const weeklyRate = (weightChange / daysDiff) * 7;
  
  let description = 'stable';
  if (Math.abs(weeklyRate) >= 0.1) {
    description = weeklyRate > 0 ? 'gaining' : 'losing';
  }
  
  return {
    description,
    weeklyRate: Math.round(weeklyRate * 100) / 100,
    totalChange: Math.round(weightChange * 100) / 100
  };
}

function buildSimplifiedContext(profile: any, nutritionAnalysis: any, goalAnalysis: any, weightHistory: any[], today: string) {
  const todaysTotals = nutritionAnalysis.dailyTotals[today] || { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
  
  return `USER PROFILE:
- Fitness Goal: ${profile?.fitness_goals || 'Not specified'}
- Daily Targets: ${profile?.target_calories || 'Not set'} kcal, ${profile?.target_protein || 'Not set'}g protein, ${profile?.target_carbs || 'Not set'}g carbs, ${profile?.target_fat || 'Not set'}g fat
- Age: ${profile?.age || 'Not provided'} | Weight: ${profile?.weight_kg || 'Not provided'}kg | Activity: ${profile?.activity_level || 'Not specified'}

TODAY'S PROGRESS (${today}):
- Consumed: ${Math.round(todaysTotals.calories)} kcal, ${Math.round(todaysTotals.protein)}g protein, ${Math.round(todaysTotals.carbs)}g carbs, ${Math.round(todaysTotals.fat)}g fat
- Meals logged: ${todaysTotals.meals}

RECENT PERFORMANCE:
- 7-day average: ${nutritionAnalysis.averages7Day.calories} kcal/day
- 30-day average: ${nutritionAnalysis.averages30Day.calories} kcal/day
- Goal status: ${goalAnalysis.goalStatus}
- Calorie deviation: ${goalAnalysis.calorieDeviation > 0 ? '+' : ''}${goalAnalysis.calorieDeviation} from target
- Overall consistency: ${nutritionAnalysis.consistency.overall}%

WEIGHT TREND:
${weightHistory.length > 0 ? `
- Current: ${weightHistory[0]?.weight_kg}kg
- Trend: ${goalAnalysis.weightTrend.description} (${goalAnalysis.weightTrend.weeklyRate > 0 ? '+' : ''}${goalAnalysis.weightTrend.weeklyRate}kg/week)
` : '- No recent weight data'}`;
}
