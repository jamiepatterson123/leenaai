import { supabase } from "@/integrations/supabase/client"
import { startOfWeek, endOfWeek, format, subDays } from "date-fns"

export const generateWeeklyReport = async (userId: string) => {
  const endDate = new Date()
  const startDate = subDays(endDate, 7)

  try {
    // Fetch this week's food diary entries
    const { data: foodEntries, error: foodError } = await supabase
      .from('food_diary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))

    if (foodError) throw foodError

    // Fetch user's targets
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('target_calories, target_protein, target_carbs, target_fat')
      .eq('user_id', userId)
      .single()

    if (profileError) throw profileError

    // Calculate weekly averages
    const totalEntries = foodEntries?.length || 0
    const totals = foodEntries?.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
        daysLogged: new Set([...acc.daysLogged, entry.date]).size,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, daysLogged: new Set() }
    )

    if (!totals || totalEntries === 0) {
      return "📊 Weekly Nutrition Report\n\nNo nutrition data was recorded this week. Start logging your meals to get detailed insights!"
    }

    const dailyAverages = {
      calories: Math.round(totals.calories / totals.daysLogged),
      protein: Math.round(totals.protein / totals.daysLogged),
      carbs: Math.round(totals.carbs / totals.daysLogged),
      fat: Math.round(totals.fat / totals.daysLogged),
    }

    // Calculate percentage of target met
    const targetPercentages = {
      calories: Math.round((dailyAverages.calories / profile.target_calories) * 100),
      protein: Math.round((dailyAverages.protein / profile.target_protein) * 100),
      carbs: Math.round((dailyAverages.carbs / profile.target_carbs) * 100),
      fat: Math.round((dailyAverages.fat / profile.target_fat) * 100),
    }

    // Generate report message
    return `📊 Your Weekly Nutrition Report
${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}

📝 Logging Consistency
Days tracked: ${totals.daysLogged}/7 (${Math.round((totals.daysLogged/7)*100)}% consistency)

📈 Daily Averages vs Targets
🔥 Calories: ${dailyAverages.calories}/${profile.target_calories} (${targetPercentages.calories}%)
🥩 Protein: ${dailyAverages.protein}g/${profile.target_protein}g (${targetPercentages.protein}%)
🍚 Carbs: ${dailyAverages.carbs}g/${profile.target_carbs}g (${targetPercentages.carbs}%)
🥑 Fat: ${dailyAverages.fat}g/${profile.target_fat}g (${targetPercentages.fat}%)

💡 Weekly Insights:
${getInsights(dailyAverages, profile, totals.daysLogged)}

Keep up the great work! 💪
Reply to this message if you need any help or advice.`

  } catch (error) {
    console.error('Error generating weekly report:', error)
    return "Unable to generate weekly report at this time. Please try again later."
  }
}

function getInsights(
  averages: { calories: number; protein: number; carbs: number; fat: number },
  targets: { target_calories: number; target_protein: number; target_carbs: number; target_fat: number },
  daysLogged: number
): string {
  const insights: string[] = []

  if (daysLogged < 7) {
    insights.push(`• Try to log your meals every day for more accurate insights`)
  }

  if (averages.calories < targets.target_calories * 0.85) {
    insights.push(`• Your calorie intake is below target. This might slow down your progress`)
  } else if (averages.calories > targets.target_calories * 1.15) {
    insights.push(`• Your calorie intake is above target. Consider adjusting portion sizes`)
  }

  if (averages.protein < targets.target_protein * 0.9) {
    insights.push(`• Increase your protein intake to support muscle maintenance and recovery`)
  }

  return insights.join('\n') || "You're doing great! Keep maintaining this balance."
}