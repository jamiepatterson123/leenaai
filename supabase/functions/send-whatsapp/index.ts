import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY')
const whatsappApiUrl = 'https://graph.facebook.com/v17.0/15551753639/messages'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  phoneNumber: string
  message: string
  type: 'reminder' | 'weekly_report'
  userId?: string
}

const generateWeeklyReport = async (userId: string) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Fetch this week's food diary entries
    const foodResponse = await fetch(
      `${supabaseUrl}/rest/v1/food_diary?user_id=eq.${userId}&select=*`,
      {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
      }
    )
    const foodEntries = await foodResponse.json()

    // Fetch user's targets
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}&select=*`,
      {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
      }
    )
    const profiles = await profileResponse.json()
    const profile = profiles[0]

    if (!profile) {
      throw new Error('Profile not found')
    }

    // Calculate weekly averages
    const totalEntries = foodEntries?.length || 0
    const uniqueDays = new Set(foodEntries.map((entry: any) => entry.date)).size

    if (totalEntries === 0) {
      return "📊 Weekly Nutrition Report\n\nNo nutrition data was recorded this week. Start logging your meals to get detailed insights!"
    }

    const totals = foodEntries.reduce((acc: any, entry: any) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    const dailyAverages = {
      calories: Math.round(totals.calories / uniqueDays),
      protein: Math.round(totals.protein / uniqueDays),
      carbs: Math.round(totals.carbs / uniqueDays),
      fat: Math.round(totals.fat / uniqueDays),
    }

    // Calculate percentage of target met
    const targetPercentages = {
      calories: Math.round((dailyAverages.calories / profile.target_calories) * 100),
      protein: Math.round((dailyAverages.protein / profile.target_protein) * 100),
      carbs: Math.round((dailyAverages.carbs / profile.target_carbs) * 100),
      fat: Math.round((dailyAverages.fat / profile.target_fat) * 100),
    }

    // Generate insights
    const insights: string[] = []
    
    if (uniqueDays < 7) {
      insights.push(`• Try to log your meals every day for more accurate insights`)
    }

    if (dailyAverages.calories < profile.target_calories * 0.85) {
      insights.push(`• Your calorie intake is below target. This might slow down your progress`)
    } else if (dailyAverages.calories > profile.target_calories * 1.15) {
      insights.push(`• Your calorie intake is above target. Consider adjusting portion sizes`)
    }

    if (dailyAverages.protein < profile.target_protein * 0.9) {
      insights.push(`• Increase your protein intake to support muscle maintenance and recovery`)
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
Reply to this message if you need any help or advice.`

  } catch (error) {
    console.error('Error generating weekly report:', error)
    return "Unable to generate weekly report at this time. Please try again later."
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phoneNumber, message, type, userId }: WhatsAppMessage = await req.json()
    let finalMessage = message

    if (type === 'reminder') {
      finalMessage = `🍽️ Daily Nutrition Reminder

Hey there! Time to log your meals and stay on track with your nutrition goals.

📸 Simply take a photo of your food to log it instantly.
💪 Stay consistent with your tracking for better results!

Need help? Just reply to this message.`
    } else if (type === 'weekly_report' && userId) {
      finalMessage = await generateWeeklyReport(userId)
    }

    const response = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: finalMessage }
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${await response.text()}`)
    }

    const result = await response.json()
    console.log('WhatsApp message sent:', result)

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-whatsapp function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})