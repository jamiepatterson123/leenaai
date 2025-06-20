
import type { NutritionAnalysis, GoalAnalysis, WeightTrend } from './types.ts';

export function calculateNutritionForTimeScope(foodEntries: any[], timeScope: string, todayString: string): NutritionAnalysis {
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

export function analyzeGoalProgress(profile: any, nutritionAnalysis: NutritionAnalysis, weightHistory: any[]): GoalAnalysis {
  const fitnessGoal = profile?.fitness_goals || 'maintenance';
  const targetCalories = profile?.target_calories || 2000;
  const averageCalories = nutritionAnalysis.averages.calories;
  
  let goalStatus = 'on_track';
  let calorieDeviation = averageCalories - targetCalories;
  
  if (fitnessGoal === 'weight_loss' && averageCalories > targetCalories) {
    goalStatus = 'above_target';
  } else if (fitnessGoal === 'muscle_gain' && averageCalories < targetCalories) {
    goalStatus = 'below_target';
  } else if (Math.abs(calorieDeviation) > targetCalories * 0.15) {
    goalStatus = 'off_target';
  }
  
  const weightTrend = analyzeWeightTrend(weightHistory);
  
  return {
    fitnessGoal,
    goalStatus,
    calorieDeviation,
    weightTrend
  };
}

export function analyzeWeightTrend(weightHistory: any[]): WeightTrend {
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
