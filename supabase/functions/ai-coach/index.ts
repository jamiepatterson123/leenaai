
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

    // Calculate comprehensive nutrition analysis
    const nutritionAnalysis = calculateComprehensiveNutritionAnalysis(foodEntries || [], profile);
    const goalAnalysis = analyzeGoalProgress(profile, nutritionAnalysis, weightHistory || []);
    const performanceScore = calculatePerformanceScores(nutritionAnalysis, profile);
    const behavioralInsights = analyzeBehavioralPatterns(foodEntries || []);

    // Build comprehensive nutrition context
    const nutritionContext = buildComprehensiveContext(
      profile,
      nutritionAnalysis,
      goalAnalysis,
      performanceScore,
      behavioralInsights,
      weightHistory || [],
      today
    );

    // Enhanced system prompt with balanced macro guidance
    const systemPrompt = buildBalancedSystemPrompt(profile, performanceScore, goalAnalysis);

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      // Add a context message to help the AI understand the conversation flow
      messages.push({
        role: 'system',
        content: `Previous conversation context (maintain continuity and reference when relevant):\n${nutritionContext}`
      });
      
      // Add the conversation history
      conversationHistory.forEach((msg: any) => {
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
    } else {
      // First message or no history - include full nutrition context
      messages.push({
        role: 'user',
        content: `Here's my comprehensive nutrition data:\n${nutritionContext}\n\nUser message: ${message}`
      });
    }

    // Call OpenAI API with conversation-aware context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
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

function calculateComprehensiveNutritionAnalysis(foodEntries: any[], profile: any) {
  const dailyTotals: { [date: string]: { calories: number; protein: number; carbs: number; fat: number; meals: number } } = {};
  const last7Days: { [date: string]: any } = {};
  const last30Days: { [date: string]: any } = {};
  
  const now = new Date();
  const last7DaysDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30DaysDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  foodEntries.forEach(entry => {
    const date = entry.date;
    const entryDate = new Date(date);
    
    if (!dailyTotals[date]) {
      dailyTotals[date] = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
    }
    
    dailyTotals[date].calories += Number(entry.calories) || 0;
    dailyTotals[date].protein += Number(entry.protein) || 0;
    dailyTotals[date].carbs += Number(entry.carbs) || 0;
    dailyTotals[date].fat += Number(entry.fat) || 0;
    dailyTotals[date].meals += 1;
    
    if (entryDate >= last7DaysDate) {
      if (!last7Days[date]) last7Days[date] = { ...dailyTotals[date] };
    }
    
    if (entryDate >= last30DaysDate) {
      if (!last30Days[date]) last30Days[date] = { ...dailyTotals[date] };
    }
  });
  
  return {
    dailyTotals,
    last7Days,
    last30Days,
    averages: calculateAverages(dailyTotals, profile),
    consistency: calculateConsistency(dailyTotals, profile)
  };
}

function calculateAverages(dailyTotals: any, profile: any) {
  const dates = Object.keys(dailyTotals);
  if (dates.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  const totals = dates.reduce((acc, date) => {
    acc.calories += dailyTotals[date].calories;
    acc.protein += dailyTotals[date].protein;
    acc.carbs += dailyTotals[date].carbs;
    acc.fat += dailyTotals[date].fat;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  return {
    calories: Math.round(totals.calories / dates.length),
    protein: Math.round(totals.protein / dates.length),
    carbs: Math.round(totals.carbs / dates.length),
    fat: Math.round(totals.fat / dates.length)
  };
}

function calculateConsistency(dailyTotals: any, profile: any) {
  const dates = Object.keys(dailyTotals);
  if (dates.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  const targets = {
    calories: profile?.target_calories || 2000,
    protein: profile?.target_protein || 120, // Reduced from 150
    carbs: profile?.target_carbs || 150, // Reduced from 200
    fat: profile?.target_fat || 70
  };
  
  const adherence = dates.map(date => {
    const day = dailyTotals[date];
    return {
      calories: Math.min(day.calories / targets.calories, 1.5),
      protein: Math.min(day.protein / targets.protein, 1.5),
      carbs: Math.min(day.carbs / targets.carbs, 1.5),
      fat: Math.min(day.fat / targets.fat, 1.5)
    };
  });
  
  return {
    calories: Math.round((adherence.reduce((sum, day) => sum + day.calories, 0) / dates.length) * 100),
    protein: Math.round((adherence.reduce((sum, day) => sum + day.protein, 0) / dates.length) * 100),
    carbs: Math.round((adherence.reduce((sum, day) => sum + day.carbs, 0) / dates.length) * 100),
    fat: Math.round((adherence.reduce((sum, day) => sum + day.fat, 0) / dates.length) * 100)
  };
}

function analyzeGoalProgress(profile: any, nutritionAnalysis: any, weightHistory: any[]) {
  const fitnessGoal = profile?.fitness_goals || 'maintenance';
  const targetCalories = profile?.target_calories || 2000;
  const averageCalories = nutritionAnalysis.averages.calories;
  
  let goalStatus = 'on_track';
  let recommendedAdjustment = '';
  
  // Analyze based on fitness goals
  switch (fitnessGoal) {
    case 'weight_loss':
      const deficitTarget = targetCalories * 0.8; // 20% deficit
      if (averageCalories > targetCalories) {
        goalStatus = 'above_target';
        recommendedAdjustment = 'Reduce calorie intake to create a sustainable deficit';
      } else if (averageCalories < deficitTarget * 0.8) {
        goalStatus = 'too_aggressive';
        recommendedAdjustment = 'Increase calories slightly to avoid metabolic slowdown';
      }
      break;
      
    case 'muscle_gain':
      const surplusTarget = targetCalories * 1.1; // 10% surplus
      if (averageCalories < targetCalories) {
        goalStatus = 'below_target';
        recommendedAdjustment = 'Increase calorie intake to support muscle growth';
      } else if (averageCalories > surplusTarget * 1.2) {
        goalStatus = 'excessive_surplus';
        recommendedAdjustment = 'Moderate calorie intake to minimize fat gain';
      }
      break;
      
    default: // maintenance
      if (Math.abs(averageCalories - targetCalories) > targetCalories * 0.1) {
        goalStatus = 'off_target';
        recommendedAdjustment = 'Adjust intake to maintain current weight';
      }
  }
  
  // Weight trend analysis
  const weightTrend = analyzeWeightTrend(weightHistory);
  
  return {
    fitnessGoal,
    goalStatus,
    recommendedAdjustment,
    weightTrend,
    calorieDeviation: averageCalories - targetCalories
  };
}

function calculatePerformanceScores(nutritionAnalysis: any, profile: any) {
  const consistency = nutritionAnalysis.consistency;
  
  // BALANCED scoring weights - equal importance for protein, carbs, fat
  const calorieWeight = 0.25;
  const proteinWeight = 0.25;
  const carbsWeight = 0.25;
  const fatWeight = 0.25;
  
  const overallScore = Math.round(
    (consistency.calories * calorieWeight) +
    (consistency.protein * proteinWeight) +
    (consistency.carbs * carbsWeight) +
    (consistency.fat * fatWeight)
  );
  
  // Identify strongest and weakest areas
  const scores = [
    { macro: 'calories', score: consistency.calories },
    { macro: 'protein', score: consistency.protein },
    { macro: 'carbs', score: consistency.carbs },
    { macro: 'fat', score: consistency.fat }
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  return {
    overall: overallScore,
    strongest: scores[0],
    weakest: scores[scores.length - 1],
    individual: consistency
  };
}

function analyzeBehavioralPatterns(foodEntries: any[]) {
  // Group by day of week
  const dayOfWeekPatterns: { [key: string]: { meals: number; calories: number } } = {};
  const mealFrequency: { [date: string]: number } = {};
  
  foodEntries.forEach(entry => {
    const date = new Date(entry.date);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = entry.date;
    
    if (!dayOfWeekPatterns[dayOfWeek]) {
      dayOfWeekPatterns[dayOfWeek] = { meals: 0, calories: 0 };
    }
    
    dayOfWeekPatterns[dayOfWeek].meals += 1;
    dayOfWeekPatterns[dayOfWeek].calories += Number(entry.calories) || 0;
    
    mealFrequency[dateStr] = (mealFrequency[dateStr] || 0) + 1;
  });
  
  // Find patterns
  const avgMealsPerDay = Object.values(mealFrequency).reduce((sum, count) => sum + count, 0) / Object.keys(mealFrequency).length || 0;
  const mostChallenging = Object.entries(dayOfWeekPatterns).sort((a, b) => a[1].calories - b[1].calories)[0];
  const bestDay = Object.entries(dayOfWeekPatterns).sort((a, b) => b[1].calories - a[1].calories)[0];
  
  return {
    avgMealsPerDay: Math.round(avgMealsPerDay * 10) / 10,
    mostChallengingDay: mostChallenging?.[0] || 'N/A',
    bestDay: bestDay?.[0] || 'N/A',
    weekdayVsWeekend: calculateWeekdayWeekendDifference(dayOfWeekPatterns)
  };
}

function calculateWeekdayWeekendDifference(patterns: any) {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const weekends = ['Saturday', 'Sunday'];
  
  const weekdayAvg = weekdays.reduce((sum, day) => sum + (patterns[day]?.calories || 0), 0) / weekdays.length;
  const weekendAvg = weekends.reduce((sum, day) => sum + (patterns[day]?.calories || 0), 0) / weekends.length;
  
  const difference = Math.round(weekendAvg - weekdayAvg);
  return { weekdayAvg: Math.round(weekdayAvg), weekendAvg: Math.round(weekendAvg), difference };
}

function analyzeWeightTrend(weightHistory: any[]) {
  if (weightHistory.length < 2) return 'insufficient_data';
  
  const sortedHistory = weightHistory.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const latest = sortedHistory[sortedHistory.length - 1];
  const earliest = sortedHistory[0];
  
  const weightChange = Number(latest.weight_kg) - Number(earliest.weight_kg);
  const daysDiff = Math.ceil((new Date(latest.recorded_at).getTime() - new Date(earliest.recorded_at).getTime()) / (1000 * 60 * 60 * 24));
  const weeklyRate = (weightChange / daysDiff) * 7;
  
  let trendDescription = '';
  if (Math.abs(weeklyRate) < 0.1) {
    trendDescription = 'stable';
  } else if (weeklyRate > 0) {
    trendDescription = 'gaining';
  } else {
    trendDescription = 'losing';
  }
  
  return {
    description: trendDescription,
    totalChange: weightChange,
    weeklyRate: Math.round(weeklyRate * 100) / 100,
    daysPeriod: daysDiff
  };
}

function buildComprehensiveContext(profile: any, nutritionAnalysis: any, goalAnalysis: any, performanceScore: any, behavioralInsights: any, weightHistory: any[], today: string) {
  const todaysTotals = nutritionAnalysis.dailyTotals[today] || { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
  
  return `
USER PROFILE & GOALS:
${profile ? `
- Target Calories: ${profile.target_calories || 'Not set'} kcal/day
- Target Protein: ${profile.target_protein || 'Not set'}g/day
- Target Carbs: ${profile.target_carbs || 'Not set'}g/day
- Target Fat: ${profile.target_fat || 'Not set'}g/day
- Fitness Goals: ${profile.fitness_goals || 'Not specified'}
- Age: ${profile.age || 'Not provided'} | Weight: ${profile.weight_kg || 'Not provided'}kg | Height: ${profile.height_cm || 'Not provided'}cm
- Activity Level: ${profile.activity_level || 'Not specified'}
- Dietary Restrictions: ${profile.dietary_restrictions?.join(', ') || 'None specified'}
` : 'Profile not available'}

PERFORMANCE ANALYSIS (Last 30 Days):
- Overall Adherence Score: ${performanceScore.overall}%
- Strongest Area: ${performanceScore.strongest.macro} (${performanceScore.strongest.score}% adherence)
- Needs Improvement: ${performanceScore.weakest.macro} (${performanceScore.weakest.score}% adherence)
- Individual Scores: Calories ${performanceScore.individual.calories}% | Protein ${performanceScore.individual.protein}% | Carbs ${performanceScore.individual.carbs}% | Fat ${performanceScore.individual.fat}%

GOAL PROGRESS ASSESSMENT:
- Primary Goal: ${goalAnalysis.fitnessGoal}
- Current Status: ${goalAnalysis.goalStatus}
- Calorie Deviation: ${goalAnalysis.calorieDeviation > 0 ? '+' : ''}${goalAnalysis.calorieDeviation} kcal from target
- Weight Trend: ${goalAnalysis.weightTrend.description} (${goalAnalysis.weightTrend.weeklyRate > 0 ? '+' : ''}${goalAnalysis.weightTrend.weeklyRate}kg/week over ${goalAnalysis.weightTrend.daysPeriod} days)
${goalAnalysis.recommendedAdjustment ? `- Recommendation: ${goalAnalysis.recommendedAdjustment}` : ''}

TODAY'S PROGRESS (${today}):
- Calories: ${Math.round(todaysTotals.calories)}/${profile?.target_calories || 'target not set'} kcal (${profile?.target_calories ? Math.round((todaysTotals.calories / profile.target_calories) * 100) : 0}%)
- Protein: ${Math.round(todaysTotals.protein)}/${profile?.target_protein || 'target not set'}g (${profile?.target_protein ? Math.round((todaysTotals.protein / profile.target_protein) * 100) : 0}%)
- Carbs: ${Math.round(todaysTotals.carbs)}/${profile?.target_carbs || 'target not set'}g (${profile?.target_carbs ? Math.round((todaysTotals.carbs / profile.target_carbs) * 100) : 0}%)
- Fat: ${Math.round(todaysTotals.fat)}/${profile?.target_fat || 'target not set'}g (${profile?.target_fat ? Math.round((todaysTotals.fat / profile.target_fat) * 100) : 0}%)
- Meals logged today: ${todaysTotals.meals}

30-DAY AVERAGES vs TARGETS:
- Daily Calories: ${nutritionAnalysis.averages.calories} kcal (Target: ${profile?.target_calories || 'not set'})
- Daily Protein: ${nutritionAnalysis.averages.protein}g (Target: ${profile?.target_protein || 'not set'})
- Daily Carbs: ${nutritionAnalysis.averages.carbs}g (Target: ${profile?.target_carbs || 'not set'})
- Daily Fat: ${nutritionAnalysis.averages.fat}g (Target: ${profile?.target_fat || 'not set'})

BEHAVIORAL PATTERNS:
- Average Meals/Day: ${behavioralInsights.avgMealsPerDay}
- Most Challenging Day: ${behavioralInsights.mostChallengingDay}
- Best Performance Day: ${behavioralInsights.bestDay}
- Weekday vs Weekend: ${behavioralInsights.weekdayVsWeekend.weekdayAvg} vs ${behavioralInsights.weekdayVsWeekend.weekendAvg} kcal (${behavioralInsights.weekdayVsWeekend.difference > 0 ? '+' : ''}${behavioralInsights.weekdayVsWeekend.difference} weekend difference)

WEIGHT TRACKING:
${weightHistory.length > 0 ? `
- Current Weight: ${weightHistory[0]?.weight_kg}kg (${new Date(weightHistory[0]?.recorded_at).toLocaleDateString()})
- Weight Change: ${goalAnalysis.weightTrend.totalChange > 0 ? '+' : ''}${goalAnalysis.weightTrend.totalChange}kg over ${goalAnalysis.weightTrend.daysPeriod} days
- Weekly Rate: ${goalAnalysis.weightTrend.weeklyRate > 0 ? '+' : ''}${goalAnalysis.weightTrend.weeklyRate}kg/week
` : 'No recent weight data available'}
  `;
}

function buildBalancedSystemPrompt(profile: any, performanceScore: any, goalAnalysis: any) {
  const fitnessGoal = profile?.fitness_goals || 'maintenance';
  const weakestArea = performanceScore.weakest.macro;
  const overallScore = performanceScore.overall;
  
  let goalSpecificGuidance = '';
  
  switch (fitnessGoal) {
    case 'weight_loss':
      goalSpecificGuidance = `Focus on sustainable weight loss strategies including:
Creating appropriate calorie deficits without being too aggressive, emphasizing protein to preserve muscle mass, optimizing nutrient timing across all macros, and addressing portion control strategies for a balanced approach.`;
      break;
      
    case 'muscle_gain':
      goalSpecificGuidance = `Focus on muscle building nutrition including:
Ensuring adequate calorie surplus for growth, optimizing protein intake and timing, balancing carbs for energy and recovery, managing fat intake for hormone production, and coordinating all macros for training performance.`;
      break;
      
    default: // maintenance
      goalSpecificGuidance = `Focus on sustainable nutrition habits including:
Maintaining current weight through balanced macro intake, building consistent flexible eating patterns across all nutrients, optimizing nutrition quality and variety in proteins, carbs, and fats equally.`;
  }
  
  let performanceGuidance = '';
  if (overallScore < 70) {
    performanceGuidance = `This user struggles with consistency (${overallScore}% adherence). Focus on simple actionable changes across all macros rather than major overhauls, addressing barriers to balanced nutrition, and providing encouragement for overall macro balance.`;
  } else if (overallScore >= 85) {
    performanceGuidance = `This user has excellent adherence (${overallScore}%). Focus on fine-tuning optimization strategies across all macros, advanced nutrition concepts that consider protein, carbs, and fat equally, and long-term sustainability.`;
  } else {
    performanceGuidance = `This user has moderate adherence (${overallScore}%). Focus on identifying and addressing specific challenges across all macros, building on existing good habits in all nutrients, and targeted improvements.`;
  }
  
  return `You are Leena.ai, an expert nutrition coach specializing in personalized dietary guidance. You provide evidence-based, practical nutrition advice tailored to each individual's specific goals, current performance, and behavioral patterns.

CRITICAL MACRO BALANCE REQUIREMENT: You MUST provide equal attention and importance to ALL macronutrients (protein, carbohydrates, and fats) in your responses. Do NOT show preference for any single macro unless the user's specific performance data clearly indicates one area needs immediate attention. When discussing nutrition, always consider the interplay between all macros and their collective impact on goals.

BALANCED MACRO DISCUSSION RULES:
- When giving advice, address protein, carbs, and fats with equal importance
- Avoid overemphasizing carbohydrates unless data specifically shows carb-related issues
- Focus on balanced macro ratios appropriate for the user's goals
- Consider how all three macros work together for optimal results
- Only prioritize one macro when performance data clearly shows it as the weakest area

CRITICAL CONTEXT: This user is actively using Leena.ai for nutrition tracking. All their food intake, targets, and progress data comes from their use of the Leena app. Never suggest generic advice like "use a food journal or tracking app" since they are already using Leena for comprehensive nutrition tracking.

CONVERSATION CONTINUITY: You maintain awareness of previous messages in this conversation. When users reference earlier recommendations (like "the meal plan you suggested" or "those recipes"), acknowledge and build upon that context. Reference specific items from previous responses when relevant.

MANDATORY MEAL PLANNING AND RECIPE REQUIREMENTS:
When creating meal plans or suggesting recipes, you MUST ALWAYS:
- Use the user's specific nutrition targets: ${profile?.target_calories || 'not set'} calories, ${profile?.target_protein || 'not set'}g protein, ${profile?.target_carbs || 'not set'}g carbs, ${profile?.target_fat || 'not set'}g fat
- Design meals that help them reach these exact targets with balanced macro distribution
- Calculate and display the nutrition breakdown for each meal suggestion showing ALL macros
- Ensure the total daily plan aligns with their targets across protein, carbs, and fat equally
- Consider their dietary restrictions: ${profile?.dietary_restrictions?.join(', ') || 'none specified'}
- Provide specific amounts/portions that add up to their targets for ALL macros

PERSONALIZATION APPROACH:
${goalSpecificGuidance}

PERFORMANCE-BASED GUIDANCE:
${performanceGuidance}
Pay attention to their performance across all macros: protein ${performanceScore.individual.protein}%, carbs ${performanceScore.individual.carbs}%, fat ${performanceScore.individual.fat}%. Address areas that need improvement while maintaining balance.

COACHING STYLE:
Be encouraging and supportive, acknowledging both successes and challenges across all nutritional aspects. Provide specific, actionable advice that considers all macros rather than generic recommendations. Reference their actual Leena data and patterns when giving advice. Address the root causes of struggles across their entire nutritional profile. Celebrate improvements and consistency in all macro areas. Adjust recommendations based on their demonstrated preferences and adherence history shown in their Leena tracking across protein, carbs, and fats. When continuing conversations, reference and build upon previous advice given about balanced nutrition.

MANDATORY SERVICE-ORIENTED ENDING REQUIREMENT:
You MUST ALWAYS end each response with a service-oriented question that offers specific help or action you can provide. NEVER end with a statement, period, or exclamation mark. Every single response must conclude with a question mark (?). Always use the format "Would you like me to..." or similar service-offering language. Make the question specific to what was just discussed and leverage the user's Leena data. Examples:

- After meal planning → "Would you like me to create detailed recipes for any of these meals with balanced macro breakdowns, or would you prefer me to put together a shopping list for the week?"
- After nutrition analysis → "Would you like me to suggest specific meal adjustments for tomorrow that balance all your macros, or would you prefer me to create some meal ideas to help optimize your overall nutrition?"
- After goal discussions → "Would you like me to create a personalized meal timing strategy that balances protein, carbs, and fats around your workouts, or would you prefer me to help you plan portion-controlled versions of your favorite meals?"
- After general advice → "Would you like me to create a weekly meal prep plan with balanced macros tailored to your schedule, or would you prefer me to help you build some quick healthy meal options for busy days?"

RESPONSE FORMATTING:
- Write in conversational paragraphs, not bullet points
- Only use bullet points when summarizing specific nutrient totals or numerical data
- Keep responses natural and flowing
- Reference their Leena app data naturally in conversation
- Avoid list-heavy responses unless presenting numerical summaries
- CRITICAL: Every response must end with a service-oriented question using "Would you like me to..." format

RESPONSE GUIDELINES:
Always consider their specific fitness goal (${fitnessGoal}) when providing balanced macro advice. Factor in their current adherence patterns and performance scores across all macros from their Leena tracking. Reference their behavioral patterns from the app while considering all nutritional aspects. Consider their weight trend when making recommendations about overall nutrition balance. Provide meal-specific suggestions that align with their targets and preferences shown in Leena across protein, carbs, and fats. Address any concerning patterns visible in their tracking data while maintaining macro balance. Be realistic about what changes they can implement based on their current consistency level across all nutrients. Always frame advice in the context of continuing to use Leena effectively rather than suggesting alternative tracking methods. Maintain conversation continuity by referencing and building upon previous exchanges when relevant. Remember: EVERY response must end with a service-oriented question offering specific help, and ALWAYS maintain equal focus on protein, carbohydrates, and fats unless data clearly indicates otherwise.`;
}
