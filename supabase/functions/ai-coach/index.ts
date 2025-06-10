import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASSISTANT_ID = 'asst_gCaTiV0aEDfB8SfJmoqH9V6Z';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, threadId } = await req.json();

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

    // Analyze user message to determine what data to fetch
    const dataIntent = analyzeMessageIntent(message);
    console.log('Data intent analyzed:', dataIntent);

    // Fetch relevant data based on intent
    const contextData = await fetchRelevantData(supabaseClient, userId, dataIntent);

    // Build context based on intent
    const nutritionContext = buildContextForIntent(profile, contextData, dataIntent);

    // Create message content with context
    const messageWithContext = `User data context:\n${nutritionContext}\n\nUser message: ${message}`;

    // Create or use existing thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        throw new Error('Failed to create thread');
      }

      const threadData = await threadResponse.json();
      currentThreadId = threadData.id;
      console.log('Created new thread:', currentThreadId);
    }

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: messageWithContext
      })
    });

    if (!messageResponse.ok) {
      throw new Error('Failed to add message to thread');
    }

    // Create run
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      })
    });

    if (!runResponse.ok) {
      throw new Error('Failed to create run');
    }

    const runData = await runResponse.json();
    const runId = runData.id;
    console.log('Created run:', runId);

    // Poll for completion
    let runStatus = 'queued';
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check run status');
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      attempts++;
      
      console.log(`Run status: ${runStatus}, attempt: ${attempts}`);
    }

    if (runStatus === 'failed') {
      throw new Error('Assistant run failed');
    }

    if (runStatus !== 'completed') {
      throw new Error('Assistant run timed out');
    }

    // Get messages from thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages?order=desc&limit=1`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      throw new Error('Failed to get messages');
    }

    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data[0];
    
    if (!assistantMessage || assistantMessage.role !== 'assistant') {
      throw new Error('No assistant response found');
    }

    const aiResponse = assistantMessage.content[0]?.text?.value || 
                      "I'm here to help with your nutrition goals. Could you tell me more about what you'd like assistance with?";

    return new Response(JSON.stringify({ 
      response: aiResponse,
      threadId: currentThreadId 
    }), {
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

function analyzeMessageIntent(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Time scope keywords
  const todayKeywords = ['today', 'so far today', 'currently', 'this morning', 'right now'];
  const weekKeywords = ['this week', 'weekly', 'past week', 'last 7 days', 'week'];
  const monthKeywords = ['this month', 'monthly', 'past month', 'last 30 days', 'month'];
  const trendKeywords = ['trend', 'trending', 'pattern', 'over time', 'progress', 'improvement'];
  
  // Data focus keywords
  const weightKeywords = ['weight', 'weigh', 'scale', 'pounds', 'kg', 'body weight'];
  const calorieKeywords = ['calories', 'calorie', 'kcal', 'energy'];
  const macroKeywords = ['protein', 'carbs', 'carbohydrates', 'fat', 'macros', 'macronutrients'];
  const performanceKeywords = ['how did i do', 'performance', 'doing', 'progress', 'goals'];
  
  let timeScope = 'comprehensive'; // default
  let dataFocus = 'all'; // default
  let questionType = 'general'; // default
  
  // Determine time scope
  if (todayKeywords.some(keyword => lowerMessage.includes(keyword))) {
    timeScope = 'today';
  } else if (weekKeywords.some(keyword => lowerMessage.includes(keyword))) {
    timeScope = 'week';
  } else if (monthKeywords.some(keyword => lowerMessage.includes(keyword))) {
    timeScope = 'month';
  } else if (trendKeywords.some(keyword => lowerMessage.includes(keyword))) {
    timeScope = 'trends';
  }
  
  // Determine data focus
  if (weightKeywords.some(keyword => lowerMessage.includes(keyword))) {
    dataFocus = 'weight';
  } else if (calorieKeywords.some(keyword => lowerMessage.includes(keyword))) {
    dataFocus = 'calories';
  } else if (macroKeywords.some(keyword => lowerMessage.includes(keyword))) {
    dataFocus = 'macros';
  } else if (performanceKeywords.some(keyword => lowerMessage.includes(keyword))) {
    dataFocus = 'performance';
  }
  
  // Determine question type
  if (performanceKeywords.some(keyword => lowerMessage.includes(keyword))) {
    questionType = 'performance_review';
  } else if (trendKeywords.some(keyword => lowerMessage.includes(keyword))) {
    questionType = 'trend_analysis';
  } else if (lowerMessage.includes('help') || lowerMessage.includes('advice') || lowerMessage.includes('should')) {
    questionType = 'advice';
  }
  
  return { timeScope, dataFocus, questionType };
}

async function fetchRelevantData(supabaseClient: any, userId: string, intent: any) {
  const now = new Date();
  let startDate: Date;
  let endDate = now;
  
  // Determine date range based on intent
  switch (intent.timeScope) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'trends':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 3 months for trends
      break;
    default: // comprehensive
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days
  }
  
  const startDateString = startDate.toISOString().split('T')[0];
  const todayString = now.toISOString().split('T')[0];
  
  console.log(`Fetching data from ${startDateString} to ${todayString} for intent:`, intent);
  
  let foodEntries = [];
  let weightHistory = [];
  
  // Fetch food data unless it's weight-only focus
  if (intent.dataFocus !== 'weight') {
    const { data: foodData, error: foodError } = await supabaseClient
      .from('food_diary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateString)
      .order('date', { ascending: false });
    
    if (foodError) {
      console.error('Error fetching food entries:', foodError);
    } else {
      foodEntries = foodData || [];
      console.log(`Found ${foodEntries.length} food entries`);
    }
  }
  
  // Fetch weight data unless it's nutrition-only focus
  if (intent.dataFocus === 'weight' || intent.dataFocus === 'performance' || intent.dataFocus === 'all') {
    const weightStartDate = intent.timeScope === 'trends' ? 
      new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) : startDate;
    
    const { data: weightData, error: weightError } = await supabaseClient
      .from('weight_history')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', weightStartDate.toISOString())
      .order('recorded_at', { ascending: false });
    
    if (weightError) {
      console.error('Error fetching weight history:', weightError);
    } else {
      weightHistory = weightData || [];
      console.log(`Found ${weightHistory.length} weight entries`);
    }
  }
  
  return {
    foodEntries,
    weightHistory,
    timeScope: intent.timeScope,
    startDate: startDateString,
    endDate: todayString
  };
}

function buildContextForIntent(profile: any, contextData: any, intent: any) {
  const { foodEntries, weightHistory, timeScope, startDate, endDate } = contextData;
  const todayString = new Date().toISOString().split('T')[0];
  
  // Calculate nutrition data
  const nutritionAnalysis = calculateNutritionForTimeScope(foodEntries, timeScope, todayString);
  const goalAnalysis = analyzeGoalProgress(profile, nutritionAnalysis, weightHistory);
  
  let context = `USER PROFILE:
- Fitness Goal: ${profile?.fitness_goals || 'Not specified'}
- Daily Targets: ${profile?.target_calories || 'Not set'} kcal, ${profile?.target_protein || 'Not set'}g protein, ${profile?.target_carbs || 'Not set'}g carbs, ${profile?.target_fat || 'Not set'}g fat
- Age: ${profile?.age || 'Not provided'} | Weight: ${profile?.weight_kg || 'Not provided'}kg | Activity: ${profile?.activity_level || 'Not specified'}

`;

  // Add relevant data based on intent
  switch (intent.timeScope) {
    case 'today':
      const todayData = nutritionAnalysis.dailyTotals[todayString] || { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
      context += `TODAY'S PROGRESS (${todayString}):
- Consumed: ${Math.round(todayData.calories)} kcal, ${Math.round(todayData.protein)}g protein, ${Math.round(todayData.carbs)}g carbs, ${Math.round(todayData.fat)}g fat
- Meals logged: ${todayData.meals}
- Remaining to target: ${Math.max(0, (profile?.target_calories || 0) - todayData.calories)} kcal`;
      break;
      
    case 'week':
      context += `THIS WEEK'S PERFORMANCE (Last 7 days):
- Average daily: ${nutritionAnalysis.averages.calories} kcal, ${nutritionAnalysis.averages.protein}g protein
- Goal adherence: ${goalAnalysis.goalStatus}
- Days with data: ${Object.keys(nutritionAnalysis.dailyTotals).length}`;
      break;
      
    case 'month':
      context += `THIS MONTH'S PERFORMANCE (Last 30 days):
- Average daily: ${nutritionAnalysis.averages.calories} kcal, ${nutritionAnalysis.averages.protein}g protein
- Consistency: ${nutritionAnalysis.consistency.overall}%
- Goal status: ${goalAnalysis.goalStatus}
- Calorie deviation: ${goalAnalysis.calorieDeviation > 0 ? '+' : ''}${goalAnalysis.calorieDeviation} from target`;
      break;
      
    case 'trends':
      context += `TREND ANALYSIS (Last 90 days):
- Average intake: ${nutritionAnalysis.averages.calories} kcal/day
- Consistency score: ${nutritionAnalysis.consistency.overall}%
- Goal adherence: ${goalAnalysis.goalStatus}`;
      
      if (weightHistory.length > 1) {
        const weightTrend = analyzeWeightTrend(weightHistory);
        context += `
- Weight trend: ${weightTrend.description} (${weightTrend.weeklyRate > 0 ? '+' : ''}${weightTrend.weeklyRate}kg/week)
- Total weight change: ${weightTrend.totalChange > 0 ? '+' : ''}${weightTrend.totalChange}kg`;
      }
      break;
      
    default: // comprehensive
      const todayDataComp = nutritionAnalysis.dailyTotals[todayString] || { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
      context += `TODAY'S PROGRESS: ${Math.round(todayDataComp.calories)} kcal, ${todayDataComp.meals} meals
RECENT AVERAGES: ${nutritionAnalysis.averages.calories} kcal/day (last 30 days)
GOAL STATUS: ${goalAnalysis.goalStatus}`;
  }
  
  // Add weight data if relevant
  if (intent.dataFocus === 'weight' && weightHistory.length > 0) {
    context += `

WEIGHT DATA:
- Current: ${weightHistory[0]?.weight_kg}kg`;
    if (weightHistory.length > 1) {
      const weightTrend = analyzeWeightTrend(weightHistory);
      context += `
- Trend: ${weightTrend.description} (${weightTrend.weeklyRate > 0 ? '+' : ''}${weightTrend.weeklyRate}kg/week)`;
    }
  }
  
  return context;
}

function calculateNutritionForTimeScope(foodEntries: any[], timeScope: string, todayString: string) {
  const dailyTotals: { [date: string]: { calories: number; protein: number; carbs: number; fat: number; meals: number } } = {};
  
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
  
  // Calculate averages
  const dates = Object.keys(dailyTotals);
  const averages = dates.length > 0 ? {
    calories: Math.round(dates.reduce((sum, date) => sum + dailyTotals[date].calories, 0) / dates.length),
    protein: Math.round(dates.reduce((sum, date) => sum + dailyTotals[date].protein, 0) / dates.length),
    carbs: Math.round(dates.reduce((sum, date) => sum + dailyTotals[date].carbs, 0) / dates.length),
    fat: Math.round(dates.reduce((sum, date) => sum + dailyTotals[date].fat, 0) / dates.length)
  } : { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  return {
    dailyTotals,
    averages,
    consistency: calculateConsistency(dailyTotals, { target_calories: 2000, target_protein: 150 })
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
  const averageCalories = nutritionAnalysis.averages.calories;
  
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
  if (weightHistory.length < 2) return { description: 'insufficient_data', weeklyRate: 0, totalChange: 0 };
  
  const sortedHistory = weightHistory.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const latest = sortedHistory[sortedHistory.length - 1];
  const earliest = sortedHistory[0];
  
  const weightChange = Number(latest.weight_kg) - Number(earliest.weight_kg);
  const daysDiff = Math.ceil((new Date(latest.recorded_at).getTime() - new Date(earliest.recorded_at).getTime()) / (1000 * 60 * 60 * 24));
  const weeklyRate = daysDiff > 0 ? (weightChange / daysDiff) * 7 : 0;
  
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
