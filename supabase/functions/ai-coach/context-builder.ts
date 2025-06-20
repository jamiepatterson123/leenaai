
import type { MessageIntent, ContextData, NutritionAnalysis } from './types.ts';
import { calculateNutritionForTimeScope, analyzeGoalProgress, analyzeWeightTrend } from './nutrition-analyzer.ts';

export function buildContextForIntent(profile: any, contextData: ContextData, intent: MessageIntent): string {
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

  // Add consultation insights if available
  if (profile?.consultation_completed && profile?.consultation_insights) {
    const insights = profile.consultation_insights;
    context += `CONSULTATION INSIGHTS (Completed: ${profile.consultation_completed_at ? new Date(profile.consultation_completed_at).toLocaleDateString() : 'Recently'}):
`;
    
    if (insights.primaryGoals) {
      context += `- Primary Goals: ${insights.primaryGoals.join(', ')}\n`;
    }
    if (insights.challenges) {
      context += `- Main Challenges: ${insights.challenges.join(', ')}\n`;
    }
    if (insights.preferences) {
      context += `- Food Preferences: ${insights.preferences.join(', ')}\n`;
    }
    if (insights.currentHabits) {
      context += `- Current Habits: ${insights.currentHabits.join(', ')}\n`;
    }
    if (insights.timeConstraints) {
      context += `- Time Constraints: ${insights.timeConstraints}\n`;
    }
    if (insights.experience_level) {
      context += `- Experience Level: ${insights.experience_level}\n`;
    }
    if (insights.motivation_factors) {
      context += `- Motivation Factors: ${insights.motivation_factors.join(', ')}\n`;
    }
    if (insights.barriers) {
      context += `- Key Barriers: ${insights.barriers.join(', ')}\n`;
    }
    if (insights.summary) {
      context += `- Consultation Summary: ${insights.summary}\n`;
    }
    context += '\n';
  }

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
      
    default:
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
