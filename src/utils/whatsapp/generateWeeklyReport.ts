import { supabase } from "@/integrations/supabase/client";
import { FoodDiaryEntry } from "@/types/food";

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Profile {
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
}

export const generateWeeklyReport = async (userId: string) => {
  try {
    // Fetch this week's food diary entries
    const { data: foodEntries, error: foodError } = await supabase
      .from('food_diary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .lte('date', new Date().toISOString().split('T')[0]);

    if (foodError) throw foodError;

    // Fetch user's targets
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('target_calories, target_protein, target_carbs, target_fat')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profiles) throw new Error('Profile not found');

    const profile = profiles as Profile;

    // Calculate weekly averages
    const totalEntries = foodEntries?.length || 0;
    const uniqueDays = new Set(foodEntries?.map(entry => entry.date)).size;

    if (totalEntries === 0) {
      return "📊 Weekly Nutrition Report\n\nNo nutrition data was recorded this week. Start logging your meals to get detailed insights!";
    }

    const totals = foodEntries.reduce<DailyTotals>((acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const dailyAverages = {
      calories: Math.round(totals.calories / uniqueDays),
      protein: Math.round(totals.protein / uniqueDays),
      carbs: Math.round(totals.carbs / uniqueDays),
      fat: Math.round(totals.fat / uniqueDays),
    };

    // Calculate percentage of target met
    const targetPercentages = {
      calories: Math.round((dailyAverages.calories / profile.target_calories) * 100),
      protein: Math.round((dailyAverages.protein / profile.target_protein) * 100),
      carbs: Math.round((dailyAverages.carbs / profile.target_carbs) * 100),
      fat: Math.round((dailyAverages.fat / profile.target_fat) * 100),
    };

    // Generate insights
    const insights: string[] = [];
    
    if (uniqueDays < 7) {
      insights.push(`• Try to log your meals every day for more accurate insights`);
    }

    if (dailyAverages.calories < profile.target_calories * 0.85) {
      insights.push(`• Your calorie intake is below target. This might slow down your progress`);
    } else if (dailyAverages.calories > profile.target_calories * 1.15) {
      insights.push(`• Your calorie intake is above target. Consider adjusting portion sizes`);
    }

    if (dailyAverages.protein < profile.target_protein * 0.9) {
      insights.push(`• Increase your protein intake to support muscle maintenance and recovery`);
    }

    // Generate report message
    return `📊 Your Weekly Nutrition Report

📝 Logging Consistency
Days tracked: ${uniqueDays}/7 (${Math.round((uniqueDays/7)*100)}% consistency)

📈 Daily Averages vs Targets
🔥 Calories: ${dailyAverages.calories}/${profile.target_calories} (${targetPercentages.calories}%)
🥩 Protein: ${dailyAverages.protein}g/${profile.target_protein}g (${targetPercentages.protein}%)
🍚 Carbs: ${dailyAverages.carbs}g/${profile.target_carbs}g (${targetPercentages.carbs}%)
🥑 Fat: ${dailyAverages.fat}g/${profile.target_fat}g (${targetPercentages.fat}%)

💡 Weekly Insights:
${insights.join('\n')}

Keep up the great work! 💪
Reply to this message if you need any help or advice.`;

  } catch (error) {
    console.error('Error generating weekly report:', error);
    return "Unable to generate weekly report at this time. Please try again later.";
  }
};