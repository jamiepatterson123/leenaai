import { supabase } from "@/integrations/supabase/client"
import { startOfWeek, endOfWeek, format } from "date-fns"

export const generateWeeklyReport = async (userId: string) => {
  const startDate = startOfWeek(new Date())
  const endDate = endOfWeek(new Date())

  try {
    // Fetch this week's food diary entries
    const { data: foodEntries, error: foodError } = await supabase
      .from('food_diary')
      .select('*')
      .eq('user_id', userId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))

    if (foodError) throw foodError

    // Calculate weekly averages
    const totalEntries = foodEntries?.length || 0
    const averages = foodEntries?.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fat: acc.fat + entry.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )

    if (!averages || totalEntries === 0) {
      return "No nutrition data recorded this week."
    }

    const dailyAverages = {
      calories: Math.round(averages.calories / totalEntries),
      protein: Math.round(averages.protein / totalEntries),
      carbs: Math.round(averages.carbs / totalEntries),
      fat: Math.round(averages.fat / totalEntries),
    }

    // Generate report message
    return `📊 Your Weekly Nutrition Report
    
Average Daily Intake:
🔥 Calories: ${dailyAverages.calories}
🥩 Protein: ${dailyAverages.protein}g
🍚 Carbs: ${dailyAverages.carbs}g
🥑 Fat: ${dailyAverages.fat}g

Keep up the good work! 💪`
  } catch (error) {
    console.error('Error generating weekly report:', error)
    return "Unable to generate weekly report at this time."
  }
}